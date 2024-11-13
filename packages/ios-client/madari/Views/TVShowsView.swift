struct TVShowsView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "tv.fill")
                .font(.system(size: 60))
            Text("TV Shows")
                .font(.title)
            Text("Watch the latest episodes")
                .foregroundColor(.gray)
        }
    }
}