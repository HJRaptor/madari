import SwiftUI

// Helper view for flowing layout
struct FlowLayout: Layout {
    let spacing: CGFloat
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.width ?? 0,
            spacing: spacing,
            subviews: subviews
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            spacing: spacing,
            subviews: subviews
        )
        
        for (index, subview) in subviews.enumerated() {
            subview.place(
                at: CGPoint(
                    x: bounds.minX + result.positions[index].x,
                    y: bounds.minY + result.positions[index].y
                ),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }
    
    struct FlowResult {
        var sizes: [CGSize]
        var positions: [CGPoint]
        var size: CGSize
        
        init(in width: CGFloat, spacing: CGFloat, subviews: Subviews) {
            var sizes = [CGSize]()
            var positions = [CGPoint]()
            
            var x: CGFloat = 0
            var y: CGFloat = 0
            var rowHeight: CGFloat = 0
            var rowMaxY: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(
                    ProposedViewSize(width: width, height: nil)
                )
                
                if x + size.width > width, x > 0 {
                    x = 0
                    y = rowMaxY + spacing
                }
                
                positions.append(CGPoint(x: x, y: y))
                sizes.append(size)
                
                rowHeight = max(rowHeight, size.height)
                rowMaxY = y + rowHeight
                x += size.width + spacing
            }
            
            self.sizes = sizes
            self.positions = positions
            self.size = CGSize(width: width, height: rowMaxY)
        }
    }
}
