import { verify } from "crypto"

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
    component?: Vertex
    distance?: number
    previousVertex?: Vertex | null
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

function printVertex(vertex: Vertex) {
    console.log(`${vertex.color}${vertex.name}${Colors.standard} => [`)

    vertex.edges.forEach((edge, edgeIndex) => {
        if (edgeIndex === 0) {
            process.stdout.write("   ");
        }
        else if (edgeIndex < vertex.edges.length) {
            process.stdout.write(", ");
        }

        process.stdout.write(`${edge.vertex.color}${edge.vertex.name}(${edge.weight})${Colors.standard}`);
    })

    console.log("")
    console.log("]")
}

function printGraph(graph: Graph) {
    graph.vertices.forEach((vertex) => printVertex(vertex))
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

function MinimalSpanningTree(graph: Graph, algorithm: (Graph: Graph) => Graph) {
    return algorithm(graph);
}

function Kruskal(graph: Graph): Graph {
    const mst = createGraph();

    const availableEdges: ExplicityEdge[] = [];

    graph.vertices.forEach((vertex) => {
        addVertex(mst, vertex.name)

        vertex.edges.forEach((edge) => {

            if (edge.used) return;

            vertex.component = vertex;
            edge.vertex.component = edge.vertex;

            availableEdges.push({
                vertex1: vertex,
                vertex2: edge.vertex,
                weight: edge.weight
            })

            const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === vertex.name);

            if (!edge2) throw new Error("Aresta inexistente");

            edge.used = true;
            edge2.used = true;
        })
    })

    availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

    const findNextVertices = () => {
        while (availableEdges.length) {
            const explicityEdge = availableEdges[0];

            availableEdges.shift();

            if (!explicityEdge.vertex1.component || !explicityEdge.vertex2.component) {
                throw new Error("Could not find next vertices");
            }

            if (explicityEdge.vertex1.component.name !== explicityEdge.vertex2.component.name) {
                return explicityEdge;
            }
        }

        throw new Error("Could not find next vertices");
    }

    const joinComponents = (
        component1: Vertex | undefined,
        component2: Vertex | undefined
    ) => {
        if (!component1 || !component2) {
            throw new Error("Could not join components")
        }

        availableEdges.forEach(({ vertex1, vertex2 }) => {
            if (!vertex1.component || !vertex2.component) {
                throw new Error("Could not join components")
            }

            if (vertex1.component.name === component2.name) {
                vertex1.component = component1
            }

            if (vertex2.component.name === component2.name) {
                vertex2.component = component1
            }
        })
    }

    for (let i = 0; i < graph.vertices.length - 1; i++) {
        const { vertex1, vertex2, weight } = findNextVertices();

        addEdge(
            mst,
            vertex1.name,
            vertex2.name,
            weight
        );

        joinComponents(vertex1.component, vertex2.component)
    }

    graph.vertices.forEach((vertex) => {
        vertex.edges.forEach((edge) => {
            delete edge.used;
        })
    })

    return mst;
}

function Prim(graph: Graph): Graph {
    const mst = createGraph();

    const availableEdges: ExplicityEdge[] = [];

    const findNextVertices = () => {
        while (availableEdges.length) {
            const explicityEdge = availableEdges[0];

            availableEdges.shift();

            if (!explicityEdge.vertex1.used || !explicityEdge.vertex2.used) {
                return explicityEdge;
            }
        }

        throw new Error("Could not find next vertices");
    }

    let currentVertex = graph.vertices[0];
    currentVertex.used = true;
    for (let i = 0; i < graph.vertices.length - 1; i++) {
        currentVertex.edges.forEach((edge) => {

            if (edge.used) return;

            availableEdges.push({
                vertex1: currentVertex,
                vertex2: edge.vertex,
                weight: edge.weight
            })

            const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === currentVertex.name);

            if (!edge2) throw new Error("Aresta inexistente");

            edge.used = true;
            edge2.used = true;
        })

        availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

        const { vertex1, vertex2, weight } = findNextVertices();

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

        console.log("---------------------------");
        printGraph(mst);
        console.log("---------------------------");

    }

    graph.vertices.forEach((vertex) => {
        delete vertex.used;

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

function dfs(vertex: Vertex, name: string): Vertex | undefined {
    vertex.color = Colors.blue

    if (vertex.name === name) {
        return vertex;
    }

    const length = vertex.edges.length

    for (let index = 0; index < length; index++) {
        const nextVertex = vertex.edges[index].vertex;
        if (nextVertex.color !== Colors.blue) {
            return dfs(nextVertex, name);
        }
    }

    return;
}

function bfs(vertex: Vertex, name: string, queue: Vertex[]): Vertex | undefined {
    if (vertex.name === name) {
        return vertex;
    }

    vertex.color = Colors.blue;

    const length = vertex.edges.length

    for (let index = 0; index < length; index++) {
        const searchVertex = vertex.edges[index].vertex;

        if (searchVertex.name === name) {
            return searchVertex;
        }

        if (searchVertex.color === Colors.standard) {
            queue.push(searchVertex);
            searchVertex.color = Colors.red;
        }
    }

    const nextVertex = queue.shift();

    return nextVertex ? bfs(nextVertex, name, queue) : undefined;
}

function depthFirstSearch(graph: Graph, name: string, keepColors = false): Vertex | undefined {
    const start = graph.vertices[0];

    clearColors(graph);
    const vertex = dfs(start, name);

    if (!keepColors) {
        clearColors(graph);
    }

    return vertex;
}

function breadthFirstSearch(graph: Graph, name: string, keepColors = false): Vertex | undefined {
    const start = graph.vertices[0];

    clearColors(graph);
    const vertex = bfs(start, name, []);

    if (!keepColors) {
        clearColors(graph);
    }

    return vertex;
}

function dijkstra(graph: Graph, startVertex: Vertex) {
    graph.vertices.forEach((vertex) => {
        vertex.distance = Infinity;
        vertex.previousVertex = null;
    })

    startVertex.distance = 0;

    clearColors(graph);

    const queue: Vertex[] = [startVertex];

    while (true) {
        const vertex = queue.shift();

        // console.log("---------------------------")
        // printGraph(graph);
        // console.log("---------------------------")
        
        if(!vertex) break;

        vertex.color = Colors.blue; 

        vertex.edges.forEach(edge => {
            const nextVertex = edge.vertex;

            if(nextVertex.color === Colors.blue) return;

            if(vertex.distance === undefined || nextVertex.distance === undefined) {
                throw new Error("Could not find distance");
            }

            if(nextVertex.distance > vertex.distance + edge.weight) {
                nextVertex.distance = vertex.distance + edge.weight
                nextVertex.previousVertex = vertex;
            }

            if(nextVertex.color === Colors.standard) {
                nextVertex.color = Colors.red;
                queue.push(nextVertex);
            }
        });
    }
}

function printPath(startVertex: Vertex, targetVertex: Vertex) {
    const stack = [];

    for(let vertex = targetVertex; vertex.previousVertex; vertex = vertex.previousVertex) {
        if(vertex.distance === undefined) {
            throw new Error("Could not find distance to previous vertex");
        }

        stack.unshift(vertex)
        process.stdout.write(``);
    }

    if(!stack.length) return;

    process.stdout.write(`${startVertex.name} => `);

    for(let vertex = stack.shift(); vertex; vertex = stack.shift()) {
        process.stdout.write(`${vertex.name}`);

        if(stack.length) {
            process.stdout.write(` => `);
        }
    }

    console.log("");
    console.log(`Total cost: ${targetVertex.distance}`);
}

function cleanDistances(graph: Graph) {
    graph.vertices.forEach((vertex) => {
        delete vertex.distance;
        delete vertex.previousVertex;
    });
}

function main() {
    const g = createGraph();
    addVertices(g, ["A", "B", "C", "D", "E", "F", "G", "H"]);
    addEdge(g, "A", "B", 2);
    addEdge(g, "A", "C", 2);
    addEdge(g, "A", "D", 0);
    addEdge(g, "B", "E", 1);
    addEdge(g, "B", "F", 0);
    addEdge(g, "B", "G", 3);
    addEdge(g, "B", "H", 0);
    addEdge(g, "C", "D", 2);
    addEdge(g, "C", "G", 1);
    addEdge(g, "D", "E", 0);
    addEdge(g, "D", "G", 1);
    addEdge(g, "D", "H", 4);
    addEdge(g, "E", "F", 1);
    addEdge(g, "E", "G", 0);
    addEdge(g, "E", "H", 3);
    addEdge(g, "F", "G", 4);

    const search = "H"
    const start = "E"

    const startVertex = breadthFirstSearch(g, start);
    
    if(startVertex) {
        dijkstra(g, startVertex);
        
        const searchVertex = breadthFirstSearch(g, search);

        if(searchVertex) {
            printPath(startVertex, searchVertex);

        }
    }
}

main();