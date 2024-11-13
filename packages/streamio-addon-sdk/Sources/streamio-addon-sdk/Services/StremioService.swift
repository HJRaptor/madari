import Foundation

/// Errors that can occur when interacting with the Stremio service
public enum StremioServiceError: Error {
    case invalidURL
    case invalidResponse
    case decodingError
    case invalidExtraParameters
    case networkError(Error)
    case manifestNotLoaded
}

/// A thread-safe service for interacting with Stremio addons
public final class StremioService: @unchecked Sendable {
    // MARK: - Properties
    
    private let baseURL: String
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    // Thread-safe manifest storage
    private let manifestQueue = DispatchQueue(label: "com.stremio.manifest")
    private var _manifest: AddonManifest?
    private var manifest: AddonManifest? {
        get {
            return manifestQueue.sync { _manifest }
        }
        set {
            manifestQueue.sync { _manifest = newValue }
        }
    }
    
    // MARK: - Initialization
    
    public init(
        baseURL: String,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        self.session = session
        
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
        
        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
    }
    
    // MARK: - Helper Methods
    
    private func validateExtra(manifest: AddonManifest, type: String, id: String, extra: [String: String]) -> Bool {
        guard let catalog = manifest.catalogs.first(where: { $0.type == type && $0.id == id }) else {
            return false
        }
        
        let validParams = Set((catalog.extraSupported ?? []) + (catalog.extraRequired ?? []))
        let providedParams = Set(extra.keys.map { AddonManifestExtraRequired(rawValue: $0) }.compactMap { $0 })
        return providedParams.isSubset(of: validParams)
    }
    
    private func buildExtraString(from extra: [String: String]) -> String {
        extra.sorted(by: { $0.key < $1.key })
             .map { "\($0.key)=\($0.value)" }
             .joined(separator: ".")
    }
    
    // MARK: - Public API
    
    /// Fetches and stores the manifest for the addon
    public func getManifest(completion: @escaping @Sendable (Result<AddonManifest, StremioServiceError>) -> Void) {
        let url: URL? = URL(string: baseURL + "/manifest.json")
        let decoder = self.decoder
        let manifestQueue = self.manifestQueue
        
        guard let requestURL = url else {
            completion(.failure(.invalidURL))
            return
        }
        
        let task = session.dataTask(with: requestURL) { [weak manifestQueue] data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            
            do {
                let manifest = try decoder.decode(AddonManifest.self, from: data)
                manifestQueue?.async {
                    self._manifest = manifest
                }
                completion(.success(manifest))
            } catch {
                print("Decoding error: \(error)")
                completion(.failure(.decodingError))
            }
        }
        task.resume()
    }
    
    /// Gets metadata for a specific type and ID
    public func getMeta(
        type: String,
        id: String,
        completion: @escaping @Sendable (Result<AddonMetaSolo, StremioServiceError>) -> Void
    ) {
        print(baseURL + "/meta/\(type)/\(id).json")
        guard let url = URL(string: baseURL + "/meta/\(type)/\(id).json") else {
            return
        }
        
        let decoder = self.decoder
        let task = session.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            
            do {
                let decoded = try decoder.decode(AddonMetaSolo.self, from: data)
                completion(.success(decoded))
            } catch {
                print("Decoding error: \(error)")
                completion(.failure(.decodingError))
            }
        }
        task.resume()
    }
    
    /// Gets stream information for a specific type and ID
    public func getStream(
        type: String,
        id: String,
        completion: @escaping @Sendable (Result<AddonStream, StremioServiceError>) -> Void
    ) {
        guard let url = URL(string: baseURL + "/stream/\(type)/\(id).json") else {
            completion(.failure(.invalidURL))
            return
        }
        
        let decoder = self.decoder
        let task = session.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            
            do {
                let decoded = try decoder.decode(AddonStream.self, from: data)
                completion(.success(decoded))
            } catch {
                print("Decoding error: \(error)")
                completion(.failure(.decodingError))
            }
        }
        task.resume()
    }
    
    /// Gets catalog items with optional extra parameters
    public func getCatalog(
        type: String,
        id: String,
        extra: [String: String]? = nil,
        completion: @escaping @Sendable (Result<AddonMeta, StremioServiceError>) -> Void
    ) {
        let currentManifest = manifest
        
        guard let manifest = currentManifest else {
            completion(.failure(.manifestNotLoaded))
            return
        }
        
        if let extra = extra {
            let isValid = validateExtra(manifest: manifest, type: type, id: id, extra: extra)
            if !isValid {
                completion(.failure(.invalidExtraParameters))
                return
            }
        }
        
        var path = "/catalog/\(type)/\(id)"
        if let extra = extra, !extra.isEmpty {
            path += "/\(buildExtraString(from: extra))"
        }
        path += ".json"
        
        guard let url = URL(string: baseURL + path) else {
            completion(.failure(.invalidURL))
            return
        }
        
        let decoder = self.decoder
        let task = session.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode),
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            
            do {
                let decoded = try decoder.decode(AddonMeta.self, from: data)
                completion(.success(decoded))
            } catch {
                print("Decoding error: \(error)")
                completion(.failure(.decodingError))
            }
        }
        task.resume()
    }
    
    /// Gets all available catalogs from the manifest
    func getAllCatalogs(completion: @escaping @Sendable (Result<[AddonManifestCatalog], StremioServiceError>) -> Void) {
        let currentManifest = manifest
        
        guard let manifest = currentManifest else {
            completion(.failure(.manifestNotLoaded))
            return
        }
        
        completion(.success(manifest.catalogs))
    }
}
