import Foundation
import OptionallyDecodable // https://github.com/idrougge/OptionallyDecodable

// MARK: - AddonSubtitle
public struct AddonSubtitle: Codable, Sendable {
    let subtitles: [AddonSubtitleSubtitle]
    let cacheMaxAge: Int?  // Made optional as it's not mentioned as required

    enum CodingKeys: String, CodingKey {
        case subtitles = "subtitles"
        case cacheMaxAge = "cacheMaxAge"
    }
}

// MARK: AddonSubtitle convenience initializers and mutators

public extension AddonSubtitle {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonSubtitle.self, from: data)
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
        subtitles: [AddonSubtitleSubtitle]? = nil,
        cacheMaxAge: Int? = nil
    ) -> AddonSubtitle {
        return AddonSubtitle(
            subtitles: subtitles ?? self.subtitles,
            cacheMaxAge: cacheMaxAge ?? self.cacheMaxAge
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonSubtitleSubtitle
public struct AddonSubtitleSubtitle: Codable, Sendable {
    let id: String      // Required
    let url: String     // Required
    let lang: String    // Required
    let subEncoding: AddonSubtitleSubEncoding?  // Optional
    let m: AddonSubtitleM?  // Optional
    let g: String?      // Optional as not mentioned as required

    enum CodingKeys: String, CodingKey {
        case id = "id"
        case url = "url"
        case subEncoding = "SubEncoding"
        case lang = "lang"
        case m = "m"
        case g = "g"
    }
}

// MARK: AddonSubtitleSubtitle convenience initializers and mutators

public extension AddonSubtitleSubtitle {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonSubtitleSubtitle.self, from: data)
    }

    func with(
        id: String? = nil,
        url: String? = nil,
        subEncoding: AddonSubtitleSubEncoding? = nil,
        lang: String? = nil,
        m: AddonSubtitleM? = nil,
        g: String? = nil
    ) -> AddonSubtitleSubtitle {
        return AddonSubtitleSubtitle(
            id: id ?? self.id,
            url: url ?? self.url,
            lang: lang ?? self.lang,
            subEncoding: subEncoding ?? self.subEncoding,
            m: m ?? self.m,
            g: g ?? self.g
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

public enum AddonSubtitleM: String, Codable, Sendable {
    case i = "i"
}

public enum AddonSubtitleSubEncoding: String, Codable, Sendable {
    case ascii = "ASCII"
    case cp1250 = "CP1250"
    case cp1252 = "CP1252"
    case cp1253 = "CP1253"
    case cp1256 = "CP1256"
    case utf8 = "UTF-8"
}
