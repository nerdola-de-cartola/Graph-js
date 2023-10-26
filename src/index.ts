interface Graph {
    vertices: Vertex[]
}

enum Colors {
    blue = "\x1b[36m",
    red = "\x1b[31m",
    standard = "\x1b[0m"
}

interface Vertex {
    name: string
    edges: Edge[]
    color: Colors
    used?: boolean
}

interface Edge {
    vertex: Vertex
    weight: number
    used?: boolean
}

function createGraph(): Graph {
    return {
        vertices: []
    }
}

function addVertex(graph: Graph, vertexName: string): boolean {
    if (graph.vertices.some((vertex) =>
        vertex.name === vertexName
    )) {
        return false;
    }

    graph.vertices.push({
        name: vertexName,
        color: Colors.standard,
        edges: []
    })

    return true;
}

function addVertices(graph: Graph, vertices: string[]): number {
    return vertices.reduce((accumulator, vertexName) => {
        const vertexAdded = addVertex(graph, vertexName);
        return vertexAdded ? accumulator + 1 : accumulator;
    }, 0);
}

function degree(graph: Graph): number {
    const sum = graph
        .vertices
        .reduce((accumulator, vertex) =>
            accumulator + vertex.edges.length, 0
        );

    return sum / 2;
}

function addEdge(
    graph: Graph,
    firstVertex: string,
    secondVertex: string,
    weight: number
): boolean {
    if (firstVertex === secondVertex) {
        return false;
    }

    const existsFirstVertex = graph.vertices.some((vertex) =>
        vertex.name === firstVertex
    );

    const existsSecondVertex = graph.vertices.some((vertex) =>
        vertex.name === secondVertex
    );

    if (!existsFirstVertex || !existsSecondVertex) {
        return false;
    }

    let result = false;

    graph.vertices.forEach((vertex) => {
        if (vertex.name === firstVertex) {
            const repeatedEdge = vertex.edges.some((edge) =>
                edge.vertex.name === secondVertex
            )

            if (repeatedEdge) {
                result = false;
                return;
            }

            const target = graph.vertices.find((vertex) => vertex.name === secondVertex);

            if (target) {
                vertex.edges.push({
                    vertex: target,
                    weight
                })

                result = true;
            }
        } else if (vertex.name === secondVertex) {
            const repeatedEdge = vertex.edges.some((edge) =>
                edge.vertex.name === firstVertex
            )

            if (repeatedEdge) {
                result = false;
                return;
            }

            const target = graph.vertices.find((vertex) => vertex.name === firstVertex);

            if (target) {
                vertex.edges.push({
                    vertex: target,
                    weight
                })

                result = true;
            }
        }
    })

    return result;
}

function degreeSequence(graph: Graph): number[] {
    return graph
        .vertices
        .reduce((accumulator: number[], vertex) =>
            [...accumulator, vertex.edges.length], []
        )
        .sort();
}

function bipartiteGraph(graph: Graph): boolean {
    while (true) {
        const startVertex = graph.vertices.find((vertex) => vertex.color === Colors.standard);

        if (!startVertex) break;

        const queue = [startVertex];

        while (queue.length > 0) {
            const vertex = queue.shift();

            if (vertex) {
                if (vertex.color === Colors.standard) {
                    vertex.color = Colors.blue;
                }

                vertex.edges.forEach((edge) => {
                    if (edge.vertex.color !== Colors.standard)
                        return;

                    edge.vertex.color = vertex.color === Colors.blue
                        ? Colors.red
                        : Colors.blue;

                    queue.push(edge.vertex)
                })
            }
        }
    }

    return graph.vertices.every((vertex) =>
        vertex.edges.every((edge) =>
            edge.vertex.color !== vertex.color
        )
    );
}

function printGraph(graph: Graph) {
    graph.vertices.forEach((vertex) => {
        console.log(`${vertex.color}${vertex.name}${Colors.standard} => [`)

        vertex.edges.forEach((edge, edgeIndex) => {
            if (edgeIndex === 0) {
                process.stdout.write("   ");
            }
            else if (edgeIndex < vertex.edges.length) {
                process.stdout.write(", ");
            }

            process.stdout.write(`${edge.vertex.color}${edge.vertex.name}${edge.weight}${Colors.standard}`);
        })

        console.log("")
        console.log("]")
    })
}

function connectedComponents(graph: Graph): Graph[] {
    const connectedComponents: Graph[] = []

    while (true) {
        const graphComponent = createGraph();
        const startVertex = graph.vertices.find((vertex) => vertex.color === Colors.standard);

        if (!startVertex) break;

        const queue = [startVertex];

        while (queue.length > 0) {
            const vertex = queue.shift();

            if (vertex) {
                graphComponent.vertices.push(vertex)

                if (vertex.color === Colors.standard) {
                    vertex.color = Colors.blue;
                }

                vertex.edges.forEach((edge) => {
                    if (edge.vertex.color !== Colors.standard)
                        return;

                    edge.vertex.color = vertex.color === Colors.blue
                        ? Colors.red
                        : Colors.blue;

                    queue.push(edge.vertex)
                })
            }
        }

        connectedComponents.push(graphComponent);
    }

    return connectedComponents;
}

function clearColors(graph: Graph) {
    graph.vertices.forEach((vertex) =>
        vertex.color = Colors.standard
    );
}

interface ExplicityEdge {
    vertex1: Vertex
    vertex2: Vertex
    weight: number
}

function MinimalSpanningTree(graph: Graph): Graph {
    const mst = createGraph();

    const availableEdges: ExplicityEdge[] = [];

    const findNextVertices = () => {
        while(availableEdges.length) {
            const explicityEdge = availableEdges[0];

            availableEdges.shift();

            if(!explicityEdge.vertex1.used || !explicityEdge.vertex2.used) {
                return explicityEdge;
            }
        }

        throw new Error("Could not find next vertices");
    }

    let currentVertex = graph.vertices[0];
    currentVertex.used = true;
    for (let i = 0; i < graph.vertices.length - 1; i++) {
        currentVertex.edges.forEach((edge) => {

            if(edge.used) return;

            availableEdges.push({
                vertex1: currentVertex,
                vertex2: edge.vertex,
                weight: edge.weight
            })

            const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === currentVertex.name);
            
            if(!edge2) throw new Error("Aresta inexistente");
            
            edge.used = true;
            edge2.used = true;
        })

        availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

        const {vertex1, vertex2, weight} = findNextVertices();

        addVertex(mst, vertex1.name);
        addVertex(mst, vertex2.name);

        addEdge(
            mst,
            vertex1.name,
            vertex2.name,
            weight
        );

        currentVertex = vertex1.used ? vertex2 : vertex1;

        vertex1.used = true;
        vertex2.used = true;

    }

    graph.vertices.forEach((vertex) => {
        vertex.edges.forEach((edge) => {
            delete edge.used;
        })
    })

    return mst;
}

function totalWeight(graph: Graph): number {
    let sum = 0

    for (let v = 0; v < graph.vertices.length; v++) {
        for (let e = 0; e < graph.vertices[v].edges.length; e++) {
            sum += graph.vertices[v].edges[e].weight;
        }
    }

    return sum / 2;
}

function main() {
    const g = createGraph();
    addVertices(g, ["A", "B", "C", "D", "E", "F"]);
    addEdge(g, "A", "B", 1);
    addEdge(g, "A", "C", 3);
    addEdge(g, "A", "D", 1);
    addEdge(g, "A", "E", 2);
    addEdge(g, "A", "F", 3);
    addEdge(g, "B", "C", 4);
    addEdge(g, "B", "D", 1);
    addEdge(g, "B", "E", 1);
    addEdge(g, "B", "F", 3);
    addEdge(g, "C", "D", 4);
    addEdge(g, "C", "E", 3);
    addEdge(g, "C", "F", 5);
    addEdge(g, "D", "E", 1);
    addEdge(g, "D", "F", 2);
    addEdge(g, "E", "F", 1);

    const mst = MinimalSpanningTree(g);
    printGraph(mst);
    // console.log(mst)
    console.log(totalWeight(mst))
}

main();