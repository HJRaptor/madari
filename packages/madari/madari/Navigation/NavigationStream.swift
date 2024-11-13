//
//  NavigationStream.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//

import streamio_addon_sdk

struct NavigationStream: Hashable {
    let stream: AddonStreamItem
    let meta: AddonMetaMeta
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(stream.uniqueId)
        hasher.combine(meta.id)
    }
    
    static func == (lhs: NavigationStream, rhs: NavigationStream) -> Bool {
        lhs.stream.uniqueId == rhs.stream.uniqueId && lhs.meta.id == rhs.meta.id
    }
}
