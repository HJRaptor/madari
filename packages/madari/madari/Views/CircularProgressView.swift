//
//  CircularProgressView.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//
import SwiftUI

struct CircularProgressView: View {
    let progress: Double
    let current: Int
    let total: Int
    let title: String
    
    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                // Background circle
                Circle()
                    .stroke(
                        Color.secondary.opacity(0.3),
                        lineWidth: 8
                    )
                
                // Progress circle
                Circle()
                    .trim(from: 0, to: CGFloat(progress))
                    .stroke(
                        Color.accentColor,
                        style: StrokeStyle(
                            lineWidth: 8,
                            lineCap: .round
                        )
                    )
                    .rotationEffect(.degrees(-90))
                
                // Percentage text
                VStack {
                    Text("\(Int(progress * 100))%")
                        .font(.title)
                        .bold()
                    Text("\(current)/\(total)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 150, height: 150)
            .padding()
            
            Text(title)
                .font(.headline)
        }
    }
}
