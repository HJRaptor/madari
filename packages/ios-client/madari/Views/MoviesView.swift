struct MoviesView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "film.fill")
                .font(.system(size: 60))
            Text("Movies")
                .font(.title)
            Text("Browse your favorite movies")
                .foregroundColor(.gray)
        }
    }
}