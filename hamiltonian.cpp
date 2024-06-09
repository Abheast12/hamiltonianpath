#include <vector>
#include <utility>
#include<iostream>

extern "C" {
    // Function to receive data from JavaScript
    void receiveData(int* nodes, int nodesLength, int* linkPairs, int linkPairsLength) {
        std::vector<int> nodesVector(nodes, nodes + nodesLength);
        std::vector<std::pair<int, int>> linkPairsVector;

        for(int i = 0; i < linkPairsLength; i += 2) {
            linkPairsVector.push_back(std::make_pair(linkPairs[i], linkPairs[i + 1]));
        }

        std::cout << "Nodes: ";
        for (int i = 0; i < nodesLength; i++) {
            std::cout << nodes[i] << " ";
        }
        std::cout << std::endl;

        // Print the link pairs
        std::cout << "Link Pairs: ";
        for(int i = 0; i < linkPairsLength; i += 2) {
            linkPairsVector.push_back(std::make_pair(linkPairs[i], linkPairs[i + 1]));
            std::cout << "(" << linkPairs[i] << ", " << linkPairs[i + 1] << ") ";
        }
        std::cout << std::endl;

        // Now you can use nodesVector and linkPairsVector in your C++ code
    }
}