#include <vector>
#include <utility>
#include <iostream>
#include <algorithm>
#include <random>
#include <emscripten.h>
#include<string>

// using namespace emscripten;

std::vector<std::pair<int, int>> randomHamiltonianPath(std::vector<int> &nodes, std::vector<std::pair<int, int>> &linkPairs, std::vector<std::vector<int>> &adj) {
    std::vector<int> path(nodes);
    std::default_random_engine engine(std::random_device{}());
    for (int attempt = 0; attempt < 10000; ++attempt) {
        std::shuffle(path.begin(), path.end(), engine);

        bool valid = true;
        for (int i = 0; i < path.size() - 1; ++i) {
            if (std::find(adj[path[i]].begin(), adj[path[i]].end(), path[i + 1]) == adj[path[i]].end()) {
                valid = false;
                break;
            }
        }

        if (valid) {
            std::vector<std::pair<int, int>> result;
            for (int i = 0; i < path.size() - 1; ++i) {
                result.push_back(std::make_pair(path[i], path[i + 1]));
                // std::cout << path[i] << " " << path[i+1] << std::endl;
            }
            return result;
        }
    }

    return std::vector<std::pair<int, int>>(); // return empty vector if no path found
}

extern "C" {
    // Function to receive data from JavaScript
    int* receiveData(int* nodes, int nodesLength, int* linkPairs, int linkPairsLength) {
        std::vector<int> nodesVector(nodes, nodes + nodesLength);
        std::vector<std::pair<int, int>> linkPairsVector;
    
        for(int i = 0; i < linkPairsLength; i += 2) {
            linkPairsVector.push_back(std::make_pair(linkPairs[i], linkPairs[i + 1]));
        }
        std::vector<std::vector<int>>adj(nodesLength+1);
        for(int i=0; i<linkPairsVector.size(); i++) {
            adj[linkPairsVector[i].first].push_back(linkPairsVector[i].second);
            adj[linkPairsVector[i].second].push_back(linkPairsVector[i].first);
        }
        // std::cout << "Nodes: ";
        // for (int i = 0; i < nodesLength; i++) {
        //     std::cout << nodes[i] << " ";
        // }
        // std::cout << std::endl;

        // // Print the link pairs
        // std::cout << "Link Pairs: ";
        // for(int i = 0; i < linkPairsLength; i += 2) {
        //     linkPairsVector.push_back(std::make_pair(linkPairs[i], linkPairs[i + 1]));
        //     std::cout << "(" << linkPairs[i] << ", " << linkPairs[i + 1] << ") ";
        // }
        // std::cout << std::endl;

        std::vector<std::pair<int, int>> path = randomHamiltonianPath(nodesVector, linkPairsVector, adj);
        if (path.size() == 0) {
            return NULL;
        }
        int* result = new int[path.size() * 2];
        for (size_t i = 0; i < path.size(); i++) {
            result[i * 2] = path[i].first;
            result[i * 2 + 1] = path[i].second;
            // std::string msg = std::to_string(path[i].first)+" "+std::to_string(path[i].second);
            // emscripten_console_log(msg.c_str());
            std::cout << path[i].first << " " << path[i].second << std::endl;
        }
        return result;
    }
    
    // std::vector<std::pair<int, int>> hamiltonianPath(std::vector<int> &nodes, std::vector<std::pair<int, int>> &linkPairs, std::vector<std::vector<int>> &adj) {
    //     std::vector<std::pair<int, int>> path;
    //     // Your code to find the Hamiltonian path goes here

    //     return path;
    // }
    
    // std::vector<std::pair<int, int>> dfs(std::vector<std::vector<int>> &adj, std::vector<int> &nodes, std::vector<bool> &visited, std::vector<std::pair<int, int>> &path, int node) {
    //     visited[node] = true;
    //     path.push_back(std::make_pair(node, nodes[node]));
    //     for(int i=0; i<adj[node].size(); i++) {
    //         if(!visited[adj[node][i]]) {
    //             path = dfs(adj, nodes, visited, path, adj[node][i]);
    //         }
    //     }
    //     return path;
    // }

}

