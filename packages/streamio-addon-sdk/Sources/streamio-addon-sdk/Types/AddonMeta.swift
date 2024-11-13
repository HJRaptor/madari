import Foundation
import OptionallyDecodable

// MARK: - AddonMeta
public struct AddonMeta: Codable, Sendable {
    public let metas: [AddonMetaMeta]
    let hasMore: Bool?
    let cacheMaxAge: Int?
    let staleRevalidate: Int?
    let staleError: Int?
}

public struct AddonMetaSolo: Codable, Sendable {
    public let meta: AddonMetaMeta
}

// MARK: AddonMeta convenience initializers and mutators
public extension AddonMeta {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonMeta.self, from: data)
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
        metas: [AddonMetaMeta]? = nil,
        hasMore: Bool? = nil,
        cacheMaxAge: Int? = nil,
        staleRevalidate: Int? = nil,
        staleError: Int? = nil
    ) -> AddonMeta {
        return AddonMeta(
            metas: metas ?? self.metas,
            hasMore: hasMore ?? self.hasMore,
            cacheMaxAge: cacheMaxAge ?? self.cacheMaxAge,
            staleRevalidate: staleRevalidate ?? self.staleRevalidate,
            staleError: staleError ?? self.staleError
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaMeta
public struct AddonMetaMeta: Codable, Sendable, Equatable, Hashable {
    public static func == (lhs: AddonMetaMeta, rhs: AddonMetaMeta) -> Bool {
        return lhs.id == rhs.id
    }
    
    public let id: String
    public let type: AddonMetaMetaType
    public let name: String
    public let genres: [String]?
    public let poster: String?
    public let posterShape: PosterShape?
    public let background: String?
    public let logo: String?
    public let description: String?
    public let releaseInfo: String?
    public let director: [String]?
    public let cast: [String]?
    public let imdbRating: String?
    public let released: String?
    public let runtime: String?
    public let language: String?
    public let country: String?
    public let awards: String?
    public let website: String?
    public let trailers: [AddonMetaTrailer]?
    public let videos: [Video]?
    public let links: [AddonMetaLink]?
    public let behaviorHints: AddonMetaBehaviorHints?
    
    let imdbID: String?
    let slug: String?
    let writer: [String]?
    public let year: String?
    let moviedbID: Int?
    let popularities: AddonMetaPopularities?
    public let genre: [String]?
    let trailerStreams: [AddonMetaTrailerStream]?

    enum CodingKeys: String, CodingKey {
        case id, type, name, genres, poster, posterShape, background, logo
        case description, releaseInfo, director, cast, imdbRating, released
        case runtime, language, country, awards, website, trailers, videos
        case links, behaviorHints
        case imdbID = "imdb_id"
        case slug, writer, year
        case moviedbID = "moviedb_id"
        case popularities, genre, trailerStreams
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Required fields
        id = try container.decode(String.self, forKey: .id)
        type = try container.decode(AddonMetaMetaType.self, forKey: .type)
        name = try container.decode(String.self, forKey: .name)
        
        // Optional fields
        genres = try container.decodeIfPresent([String].self, forKey: .genres)
        poster = try container.decodeIfPresent(String.self, forKey: .poster)
        posterShape = try container.decodeIfPresent(PosterShape.self, forKey: .posterShape)
        background = try container.decodeIfPresent(String.self, forKey: .background)
        logo = try container.decodeIfPresent(String.self, forKey: .logo)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        releaseInfo = try container.decodeIfPresent(String.self, forKey: .releaseInfo)
        director = try container.decodeIfPresent([String].self, forKey: .director)
        cast = try container.decodeIfPresent([String].self, forKey: .cast)
        imdbRating = try container.decodeIfPresent(String.self, forKey: .imdbRating)
        released = try container.decodeIfPresent(String.self, forKey: .released)
        runtime = try container.decodeIfPresent(String.self, forKey: .runtime)
        language = try container.decodeIfPresent(String.self, forKey: .language)
        country = try container.decodeIfPresent(String.self, forKey: .country)
        awards = try container.decodeIfPresent(String.self, forKey: .awards)
        website = try container.decodeIfPresent(String.self, forKey: .website)
        trailers = try container.decodeIfPresent([AddonMetaTrailer].self, forKey: .trailers)
        videos = try container.decodeIfPresent([Video].self, forKey: .videos)
        links = try container.decodeIfPresent([AddonMetaLink].self, forKey: .links)
        behaviorHints = try container.decodeIfPresent(AddonMetaBehaviorHints.self, forKey: .behaviorHints)
        
        // Additional optional fields
        imdbID = try container.decodeIfPresent(String.self, forKey: .imdbID)
        slug = try container.decodeIfPresent(String.self, forKey: .slug)
        writer = try container.decodeIfPresent([String].self, forKey: .writer)
        year = try container.decodeIfPresent(String.self, forKey: .year)
        moviedbID = try container.decodeIfPresent(Int.self, forKey: .moviedbID)
        popularities = try container.decodeIfPresent(AddonMetaPopularities.self, forKey: .popularities)
        genre = try container.decodeIfPresent([String].self, forKey: .genre)
        trailerStreams = try container.decodeIfPresent([AddonMetaTrailerStream].self, forKey: .trailerStreams)
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

public enum PosterShape: String, Codable, Sendable {
    case square = "square"
    case poster = "poster"
    case landscape = "landscape"
}

// MARK: - Video
public struct Video: Codable, Sendable {
    public let id: String // required
    public let title: String? // required
    public let released: String? // required
    public let thumbnail: String? // optional
    public let streams: [Stream]? // optional
    public let available: Bool? // optional
    public let episode: Int? // optional
    public let season: Int? // optional
    public let trailers: [Stream]? // optional
    public let overview: String? // optional
}

// MARK: Video convenience initializers and mutators
public extension Video {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(Video.self, from: data)
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
        title: String? = nil,
        released: String? = nil,
        thumbnail: String? = nil,
        streams: [Stream]? = nil,
        available: Bool? = nil,
        episode: Int? = nil,
        season: Int? = nil,
        trailers: [Stream]? = nil,
        overview: String? = nil
    ) -> Video {
        return Video(
            id: id ?? self.id,
            title: title ?? self.title,
            released: released ?? self.released,
            thumbnail: thumbnail ?? self.thumbnail,
            streams: streams ?? self.streams,
            available: available ?? self.available,
            episode: episode ?? self.episode,
            season: season ?? self.season,
            trailers: trailers ?? self.trailers,
            overview: overview ?? self.overview
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - Stream
public struct Stream: Codable, Sendable {
    let source: String?
    let type: String?
}

// MARK: Stream convenience initializers and mutators
public extension Stream {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(Stream.self, from: data)
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
        source: String? = nil,
        type: String? = nil
    ) -> Stream {
        return Stream(
            source: source ?? self.source,
            type: type ?? self.type
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaBehaviorHints
public struct AddonMetaBehaviorHints: Codable, Sendable {
    let defaultVideoID: String? // optional
    let hasScheduledVideos: Bool? // This wasn't in docs but keeping as optional

    enum CodingKeys: String, CodingKey {
        case defaultVideoID = "defaultVideoId"
        case hasScheduledVideos
    }
}

// MARK: AddonMetaBehaviorHints convenience initializers and mutators
public extension AddonMetaBehaviorHints {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonMetaBehaviorHints.self, from: data)
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
        defaultVideoID: String? = nil,
        hasScheduledVideos: Bool? = nil
    ) -> AddonMetaBehaviorHints {
        return AddonMetaBehaviorHints(
            defaultVideoID: defaultVideoID ?? self.defaultVideoID,
            hasScheduledVideos: hasScheduledVideos ?? self.hasScheduledVideos
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaLink
public struct AddonMetaLink: Codable, Sendable {
    public let name: String // required
    public let category: String // required
    public let url: String // required
}

// MARK: AddonMetaLink convenience initializers and mutators
public extension AddonMetaLink {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonMetaLink.self, from: data)
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
        name: String? = nil,
        category: String? = nil,
        url: String? = nil
    ) -> AddonMetaLink {
        return AddonMetaLink(
            name: name ?? self.name,
            category: category ?? self.category,
            url: url ?? self.url
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaPopularities
public struct AddonMetaPopularities: Codable, Sendable {
    let moviedb: Double?
    let stremio: Double?
    let stremioLIB: Int?
    let trakt: Int?

    enum CodingKeys: String, CodingKey {
        case moviedb
        case stremio
        case stremioLIB = "stremio_lib"
        case trakt
    }
}

// MARK: AddonMetaPopularities convenience initializers and mutators (continued)
public extension AddonMetaPopularities {
    func with(
        moviedb: Double? = nil,
        stremio: Double? = nil,
        stremioLIB: Int? = nil,
        trakt: Int? = nil
    ) -> AddonMetaPopularities {
        return AddonMetaPopularities(
            moviedb: moviedb ?? self.moviedb,
            stremio: stremio ?? self.stremio,
            stremioLIB: stremioLIB ?? self.stremioLIB,
            trakt: trakt ?? self.trakt
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaTrailerStream
public struct AddonMetaTrailerStream: Codable, Sendable {
    let title: String
    let ytID: String

    enum CodingKeys: String, CodingKey {
        case title
        case ytID = "ytId"
    }
}

// MARK: AddonMetaTrailerStream convenience initializers and mutators
public extension AddonMetaTrailerStream {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonMetaTrailerStream.self, from: data)
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
        title: String? = nil,
        ytID: String? = nil
    ) -> AddonMetaTrailerStream {
        return AddonMetaTrailerStream(
            title: title ?? self.title,
            ytID: ytID ?? self.ytID
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

// MARK: - AddonMetaTrailer
public struct AddonMetaTrailer: Codable, Sendable {
    let source: String?
    let type: String?
}

// MARK: AddonMetaTrailer convenience initializers and mutators
public extension AddonMetaTrailer {
    init(data: Data) throws {
        self = try newJSONDecoder().decode(AddonMetaTrailer.self, from: data)
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
        source: String? = nil,
        type: String? = nil
    ) -> AddonMetaTrailer {
        return AddonMetaTrailer(
            source: source ?? self.source,
            type: type ?? self.type
        )
    }

    func jsonData() throws -> Data {
        return try newJSONEncoder().encode(self)
    }

    func jsonString(encoding: String.Encoding = .utf8) throws -> String? {
        return String(data: try self.jsonData(), encoding: encoding)
    }
}

public enum AddonMetaMetaType: String, Codable, Sendable {
    case movie = "movie"
    case series = "series"
    case channel = "channel"
    case tv = "tv"
}
