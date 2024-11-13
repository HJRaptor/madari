//
//  ShimmerEffect.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//
import SwiftUI

struct ShimmerEffect: ViewModifier {
    @State private var phase: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .mask(
                LinearGradient(
                    gradient: Gradient(stops: [
                        .init(color: .black.opacity(0.3), location: phase - 0.5),
                        .init(color: .black, location: phase),
                        .init(color: .black.opacity(0.3), location: phase + 0.5)
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

struct ShimmerCatalogRow: View {
    let itemsPerRow: Int
    let horizontalPadding: CGFloat
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title shimmer
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.3))
                .frame(width: 150, height: 24)
                .modifier(ShimmerEffect())
            
            // Grid of shimmer items
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: itemsPerRow),
                spacing: 16
            ) {
                ForEach(0..<itemsPerRow, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.3))
                        .aspectRatio(2/3, contentMode: .fit)
                        .modifier(ShimmerEffect())
                }
            }
        }
        .padding(.horizontal, horizontalPadding)
    }
}

// Preview provider
struct ShimmerCatalogRow_Previews: PreviewProvider {
    static var previews: some View {
        ShimmerCatalogRow(itemsPerRow: 4, horizontalPadding: 20)
            .previewLayout(.sizeThatFits)
            .padding()
            .preferredColorScheme(.dark)
        
        ShimmerCatalogRow(itemsPerRow: 4, horizontalPadding: 20)
            .previewLayout(.sizeThatFits)
            .padding()
            .preferredColorScheme(.light)
    }
}
