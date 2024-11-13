struct HomeView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "house.fill")
                .font(.system(size: 60))
            Text("Welcome Home")
                .font(.title)
            Text("Latest Updates and Recommendations")
                .foregroundColor(.gray)
        }
    }
}
