struct LibraryView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "books.vertical.fill")
                .font(.system(size: 60))
            Text("Library")
                .font(.title)
            Text("Your collected content")
                .foregroundColor(.gray)
        }
    }
}