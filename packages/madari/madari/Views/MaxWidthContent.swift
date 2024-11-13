//
//  MaxWidthContent.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//


import SwiftUI

struct MaxWidthContent<Content: View>: View {
    let content: Content
    let maxWidth: CGFloat
    let horizontalPadding: CGFloat
    
    init(
        maxWidth: CGFloat = 1200,
        horizontalPadding: CGFloat = 20,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.maxWidth = maxWidth
        self.horizontalPadding = horizontalPadding
    }
    
    var body: some View {
        HStack(spacing: 0) {
            Spacer(minLength: 0)
            content
                .frame(maxWidth: maxWidth)
                .padding(.horizontal, horizontalPadding)
            Spacer(minLength: 0)
        }
    }
}
