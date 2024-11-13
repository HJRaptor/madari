//
//  AddonLoadingState.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//


// MARK: - Loading State
enum AddonLoadingState : Equatable {
    case notStarted
    case loading(progress: Double, total: Int)
    case loaded
    case failed(Error)
    
    static func == (lhs: AddonLoadingState, rhs: AddonLoadingState) -> Bool {
            switch (lhs, rhs) {
            case (.notStarted, .notStarted):
                return true
            case let (.loading(p1, t1), .loading(p2, t2)):
                return p1 == p2 && t1 == t2
            case (.loaded, .loaded):
                return true
            case let (.failed(e1), .failed(e2)):
                return e1.localizedDescription == e2.localizedDescription
            default:
                return false
            }
        }

}
