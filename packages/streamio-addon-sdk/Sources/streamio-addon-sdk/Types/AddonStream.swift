import Foundation
import OptionallyDecodable

// MARK: - AddonStream
public struct AddonStream: Codable, Sendable {
    public let streams: [AddonStreamItem]

    enum CodingKeys: String, CodingKey {
        case streams = "streams"
    }
}

// MARK: - AddonStreamItem
public struct AddonStreamItem: Codable, Sendable {
    // Required - One of these must be present
    public let url: String?
    public let ytId: String?
    public let infoHash: String?
    public let fileIdx: Int?
    public let externalURL: String?
    
    // Optional properties
    public let name: String?
    public let title: String?
    public let description: String?
    public let subtitles: [AddonStreamSubtitle]?
    public let sources: [String]?
    
    // Platform-specific URLs (all optional)
    public let androidTvURL: String?
    public let tizenURL: String?
    public let webosURL: String?
    public let iosURL: String?
    public let tvOSURL: String?
    public let fireTvURL: String?
    
    // Behavior hints
    public let behaviorHints: AddonStreamBehaviorHints?

    enum CodingKeys: String, CodingKey {
        case url = "url"
        case ytId = "ytId"
        case infoHash = "infoHash"
        case fileIdx = "fileIdx"
        case externalURL = "externalUrl"
        case name = "name"
        case title = "title"
        case description = "description"
        case subtitles = "subtitles"
        case sources = "sources"
        case androidTvURL = "androidTvUrl"
        case tizenURL = "tizenUrl"
        case webosURL = "webosUrl"
        case iosURL = "iosUrl"
        case tvOSURL = "tvOsUrl"
        case fireTvURL = "fireTvUrl"
        case behaviorHints = "behaviorHints"
    }
}

extension AddonStreamItem: Hashable, Equatable {
    public static func == (lhs: AddonStreamItem, rhs: AddonStreamItem) -> Bool {
        // Compare all required fields that could identify a stream
        if lhs.url != nil || rhs.url != nil {
            return lhs.url == rhs.url
        }
        if lhs.ytId != nil || rhs.ytId != nil {
            return lhs.ytId == rhs.ytId
        }
        if lhs.infoHash != nil || rhs.infoHash != nil {
            return lhs.infoHash == rhs.infoHash && lhs.fileIdx == rhs.fileIdx
        }
        if lhs.externalURL != nil || rhs.externalURL != nil {
            return lhs.externalURL == rhs.externalURL
        }
        // If no identifying fields are present, compare all fields
        return lhs.url == rhs.url &&
               lhs.ytId == rhs.ytId &&
               lhs.infoHash == rhs.infoHash &&
               lhs.fileIdx == rhs.fileIdx &&
               lhs.externalURL == rhs.externalURL &&
               lhs.name == rhs.name &&
               lhs.title == rhs.title &&
               lhs.description == rhs.description &&
               lhs.sources == rhs.sources &&
               lhs.androidTvURL == rhs.androidTvURL &&
               lhs.tizenURL == rhs.tizenURL &&
               lhs.webosURL == rhs.webosURL &&
               lhs.iosURL == rhs.iosURL &&
               lhs.tvOSURL == rhs.tvOSURL &&
               lhs.fireTvURL == rhs.fireTvURL
    }
    
    public func hash(into hasher: inout Hasher) {
        // Hash the primary identifying fields
        hasher.combine(url)
        hasher.combine(ytId)
        hasher.combine(infoHash)
        hasher.combine(fileIdx)
        hasher.combine(externalURL)
    }
}

// MARK: - AddonStreamSubtitle
public struct AddonStreamSubtitle: Codable, Sendable {
    let url: String
    let lang: String
}

// MARK: - AddonStreamBehaviorHints
public struct AddonStreamBehaviorHints: Codable, Sendable {
    let countryWhitelist: [String]?
    public let notWebReady: Bool?
    public let bingeGroup: String?
    let proxyHeaders: AddonStreamProxyHeaders?
    let videoHash: String?
    let videoSize: Int?
    let filename: String?
}

// MARK: - AddonStreamProxyHeaders
public struct AddonStreamProxyHeaders: Codable, Sendable {
    let request: [String: String]?
    let response: [String: String]?
}

// MARK: AddonStream convenience initializers and mutators
public extension AddonStream {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonStream.self, from: data)
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
        streams: [AddonStreamItem]? = nil
    ) -> AddonStream {
        return AddonStream(
            streams: streams ?? self.streams
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: AddonStreamItem convenience initializers and mutators
public extension AddonStreamItem {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonStreamItem.self, from: data)
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
        url: String?? = nil,
        ytId: String?? = nil,
        infoHash: String?? = nil,
        fileIdx: Int?? = nil,
        externalURL: String? = nil,
        name: String? = nil,
        title: String? = nil,
        description: String? = nil,
        subtitles: [AddonStreamSubtitle]? = nil,
        sources: [String]? = nil,
        androidTvURL: String? = nil,
        tizenURL: String? = nil,
        webosURL: String? = nil,
        iosURL: String? = nil,
        tvOSURL: String? = nil,
        fireTvURL: String? = nil,
        behaviorHints: AddonStreamBehaviorHints? = nil
    ) -> AddonStreamItem {
        return AddonStreamItem(
            url: url ?? self.url,
            ytId: ytId ?? self.ytId,
            infoHash: infoHash ?? self.infoHash,
            fileIdx: fileIdx ?? self.fileIdx,
            externalURL: externalURL ?? self.externalURL,
            name: name ?? self.name,
            title: title ?? self.title,
            description: description ?? self.description,
            subtitles: subtitles ?? self.subtitles,
            sources: sources ?? self.sources,
            androidTvURL: androidTvURL ?? self.androidTvURL,
            tizenURL: tizenURL ?? self.tizenURL,
            webosURL: webosURL ?? self.webosURL,
            iosURL: iosURL ?? self.iosURL,
            tvOSURL: tvOSURL ?? self.tvOSURL,
            fireTvURL: fireTvURL ?? self.fireTvURL,
            behaviorHints: behaviorHints ?? self.behaviorHints
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}
