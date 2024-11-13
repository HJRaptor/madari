import Foundation
import OptionallyDecodable

public enum AddonManifestResource: Codable, Sendable {
    case simple(String)
    case complex(ComplexResource)
    
    public struct ComplexResource: Codable, Sendable {
        public let name: String
        public let types: [String]
        public let idPrefixes: [String]
        
        enum CodingKeys: String, CodingKey {
            case name
            case types
            case idPrefixes
        }
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if let stringValue = try? container.decode(String.self) {
            self = .simple(stringValue)
        } else if let complexValue = try? container.decode(ComplexResource.self) {
            self = .complex(complexValue)
        } else {
            throw DecodingError.typeMismatch(
                AddonManifestResource.self,
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Expected either String or ComplexResource"
                )
            )
        }
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .simple(let string):
            try container.encode(string)
        case .complex(let resource):
            try container.encode(resource)
        }
    }
}

// MARK: - AddonManifestElement
public struct AddonManifestElement: Codable, Sendable {
    public let id: String
    public let version: String
    public let description: String
    public let name: String
    public let resources: [AddonManifestResource]
    public let types: [String]
    public let idPrefixes: [String]?
    public let addonCatalogs: [AddonManifestAddonCatalog]?
    public let catalogs: [AddonManifestCatalog]
    public let behaviorHints: AddonManifestBehaviorHints?
    public let logo: String?
    public let background: String?
    public let lastUpdate: String?
    public let serverVersion: String?

    enum CodingKeys: String, CodingKey {
        case id = "id"
        case version = "version"
        case description = "description"
        case name = "name"
        case resources = "resources"
        case types = "types"
        case idPrefixes = "idPrefixes"
        case addonCatalogs = "addonCatalogs"
        case catalogs = "catalogs"
        case behaviorHints = "behaviorHints"
        case logo = "logo"
        case background = "background"
        case lastUpdate = "last_update"
        case serverVersion = "server_version"
    }
}

// MARK: AddonManifestElement convenience initializers and mutators

public extension AddonManifestElement {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonManifestElement.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        id: String? = nil,
        version: String? = nil,
        description: String? = nil,
        name: String? = nil,
        resources: [AddonManifestResource]? = nil,
        types: [String]? = nil,
        idPrefixes: [String]? = nil,
        addonCatalogs: [AddonManifestAddonCatalog]?? = nil,
        catalogs: [AddonManifestCatalog]? = nil,
        behaviorHints: AddonManifestBehaviorHints?? = nil,
        logo: String?? = nil,
        background: String?? = nil,
        lastUpdate: String?? = nil,
        serverVersion: String?? = nil
    ) -> AddonManifestElement {
        return AddonManifestElement(
            id: id ?? self.id,
            version: version ?? self.version,
            description: description ?? self.description,
            name: name ?? self.name,
            resources: resources ?? self.resources,
            types: types ?? self.types,
            idPrefixes: idPrefixes ?? self.idPrefixes,
            addonCatalogs: addonCatalogs ?? self.addonCatalogs,
            catalogs: catalogs ?? self.catalogs,
            behaviorHints: behaviorHints ?? self.behaviorHints,
            logo: logo ?? self.logo,
            background: background ?? self.background,
            lastUpdate: lastUpdate ?? self.lastUpdate,
            serverVersion: serverVersion ?? self.serverVersion
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonManifestAddonCatalog
public struct AddonManifestAddonCatalog: Codable, Sendable {
    let type: String
    let id: AddonManifestID?
    let name: AddonManifestName?

    enum CodingKeys: String, CodingKey {
        case type = "type"
        case id = "id"
        case name = "name"
    }
}

// MARK: AddonManifestAddonCatalog convenience initializers and mutators

public extension AddonManifestAddonCatalog {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonManifestAddonCatalog.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil,
        id: AddonManifestID?? = nil,
        name: AddonManifestName?? = nil
    ) -> AddonManifestAddonCatalog {
        return AddonManifestAddonCatalog(
            type: type ?? self.type,
            id: id ?? self.id,
            name: name ?? self.name
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

public enum AddonManifestID: String, Codable, Sendable {
    case community = "community"
    case official = "official"
}

public enum AddonManifestName: String, Codable, Sendable {
    case community = "Community"
    case official = "Official"
}

// MARK: - AddonManifestBehaviorHints
public struct AddonManifestBehaviorHints: Codable, Sendable {
    let newEpisodeNotifications: Bool?
    let configurable: Bool?
    let configurationRequired: Bool?

    enum CodingKeys: String, CodingKey {
        case newEpisodeNotifications = "newEpisodeNotifications"
        case configurable = "configurable"
        case configurationRequired = "configurationRequired"
    }
}

// MARK: AddonManifestBehaviorHints convenience initializers and mutators

public extension AddonManifestBehaviorHints {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonManifestBehaviorHints.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        newEpisodeNotifications: Bool?? = nil,
        configurable: Bool?? = nil,
        configurationRequired: Bool?? = nil
    ) -> AddonManifestBehaviorHints {
        return AddonManifestBehaviorHints(
            newEpisodeNotifications: newEpisodeNotifications ?? self.newEpisodeNotifications,
            configurable: configurable ?? self.configurable,
            configurationRequired: configurationRequired ?? self.configurationRequired
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonManifestCatalog
public struct AddonManifestCatalog: Codable, Sendable {
    public let type: String
    public let id: String
    let genres: [String]?
    public let extra: [AddonManifestExtra]?
    public let extraSupported: [AddonManifestExtraRequired]?
    let name: String
    public let extraRequired: [AddonManifestExtraRequired]?
    let pageSize: Int?

    enum CodingKeys: String, CodingKey {
        case type = "type"
        case id = "id"
        case genres = "genres"
        case extra = "extra"
        case extraSupported = "extraSupported"
        case name = "name"
        case extraRequired = "extraRequired"
        case pageSize = "pageSize"
    }
}

// MARK: AddonManifestCatalog convenience initializers and mutators

public extension AddonManifestCatalog {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonManifestCatalog.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        type: String? = nil,
        id: String? = nil,
        genres: [String]?? = nil,
        extra: [AddonManifestExtra]?? = nil,
        extraSupported: [AddonManifestExtraRequired]?? = nil,
        name: String? = nil,
        extraRequired: [AddonManifestExtraRequired]?? = nil,
        pageSize: Int?? = nil
    ) -> AddonManifestCatalog {
        return AddonManifestCatalog(
            type: type ?? self.type,
            id: id ?? self.id,
            genres: genres ?? self.genres,
            extra: extra ?? self.extra,
            extraSupported: extraSupported ?? self.extraSupported,
            name: name ?? self.name,
            extraRequired: extraRequired ?? self.extraRequired,
            pageSize: pageSize ?? self.pageSize
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonManifestExtra
public struct AddonManifestExtra: Codable, Sendable {
    let name: AddonManifestExtraRequired?
    let options: [String]?
    let isRequired: Bool?
    let optionsLimit: Int?

    enum CodingKeys: String, CodingKey {
        case name = "name"
        case options = "options"
        case isRequired = "isRequired"
        case optionsLimit = "optionsLimit"
    }
}

// MARK: AddonManifestExtra convenience initializers and mutators

public extension AddonManifestExtra {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonManifestExtra.self, from: data)
    }

    init(_ json: String, using encoding: String.Encoding = .utf8) throws {
        guard let data = json.data(using: encoding) else {
            throw NSError(domain: "JSONDecoding", code: 0, userInfo: nil)
        }
        try self.init(data: data)
    }

    init(fromURL url: URL) throws {
        try self.init(data: try Data(contentsOf: url))
    }

    func with(
        name: AddonManifestExtraRequired?? = nil,
        options: [String]?? = nil,
        isRequired: Bool?? = nil,
        optionsLimit: Int?? = nil
    ) -> AddonManifestExtra {
        return AddonManifestExtra(
            name: name ?? self.name,
            options: options ?? self.options,
            isRequired: isRequired ?? self.isRequired,
            optionsLimit: optionsLimit ?? self.optionsLimit
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

public enum AddonManifestExtraRequired: String, Codable, Sendable {
    case calendarVideosIDS = "calendarVideosIds"
    case genre = "genre"
    case lastVideosIDS = "lastVideosIds"
    case search = "search"
    case skip = "skip"
}

public typealias AddonManifest = AddonManifestElement

// MARK: - Helper functions for creating encoders and decoders

func newJSONDecoder() -> JSONDecoder {
    let decoder = JSONDecoder()
    if #available(iOS 10.0, OSX 10.12, tvOS 10.0, watchOS 3.0, *) {
        decoder.dateDecodingStrategy = .iso8601
    }
    return decoder
}

func newJSONEncoder() -> JSONEncoder {
    let encoder = JSONEncoder()
    if #available(iOS 10.0, OSX 10.12, tvOS 10.0, watchOS 3.0, *) {
        encoder.dateEncodingStrategy = .iso8601
    }
    return encoder
}
