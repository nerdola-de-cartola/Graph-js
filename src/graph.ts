const util = require('util')

interface Graph {
    vertices: Vertex[]
}

enum Colors {
    blue = "\x1b[36m",
    red = "\x1b[31m"
}

interface Vertex {
    name: string
    edges: Edge[]
    color?: Colors
}

interface Edge {
    vertex: Vertex
    weight: number;
}

const resetColor = "\x1b[0m";

function createGraph(): Graph {
    return {
        vertices: []
    }
}

function addVertex(graph: Graph, vertex: string) {
    graph.vertices.push({
        name: vertex,
        edges: []
    })
}

function addVertices(graph: Graph, vertices: string[]) {
    vertices.forEach((vertex) =>
        addVertex(graph, vertex)
    );
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
    let result = false;

    if (firstVertex === secondVertex) {
        return false;
    }

    graph.vertices.forEach((vertex) => {
        if (vertex.name === firstVertex) {
            const repeatedEdge = vertex.edges.some((edge) =>
                edge.vertex.name === secondVertex
            )

            if (repeatedEdge) {
                result = false;
                return;
            }

            vertex.edges.push({
                vertex: graph.vertices.find((vertex) => vertex.name === secondVertex),
                weight
            })

            result = true;
        } else if (vertex.name === secondVertex) {
            const repeatedEdge = vertex.edges.some((edge) =>
                edge.vertex.name === firstVertex
            )

            if (repeatedEdge) {
                result = false;
                return;
            }

            vertex.edges.push({
                vertex: graph.vertices.find((vertex) => vertex.name === firstVertex),
                weight
            })

            result = true;
        }
    })

    return result;
}

function degreeSequence(graph: Graph): number[] {
    return graph
        .vertices
        .reduce((accumulator, vertex) =>
            [...accumulator, vertex.edges.length], []
        )
        .sort();
}


function bipartiteGraph(graph: Graph): boolean {
    while (true) {
        const startVertex = graph.vertices.find((vertex) => vertex.color === undefined);

        if (!startVertex) break;

        const queue = [startVertex];

        while (queue.length > 0) {
            const vertex = queue.shift();

            if (!vertex.color) {
                vertex.color = Colors.blue;
            }

            vertex.edges.forEach((edge) => {
                if (edge.vertex.color !== undefined)
                    return;

                edge.vertex.color = vertex.color === Colors.blue
                    ? Colors.red
                    : Colors.blue;

                queue.push(edge.vertex)
            })
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
        console.log(`${vertex.color}${vertex.name}${resetColor} => [`)

        vertex.edges.forEach((edge, edgeIndex) => {
            if (edgeIndex === 0) {
                process.stdout.write("   ");
            }
            else if (edgeIndex < vertex.edges.length) {
                process.stdout.write(", ");
            }

            process.stdout.write(`${edge.vertex.color}${edge.vertex.name}${resetColor}`);
        })

        console.log("")
        console.log("]")
    })
}

function main() {
    const g = createGraph();
    addVertices(g, ["A", "B", "C", "D", "E"])
    addEdge(g, "A", "B", 1);
    addEdge(g, "B", "C", 1);
    addEdge(g, "C", "D", 1);
    addEdge(g, "D", "E", 1);
    addEdge(g, "E", "A", 1);

    process.stdout.write("O grafo é bipartido? ");
    console.log(bipartiteGraph(g) ? "Sim" : " Não");

    printGraph(g);
}

main();