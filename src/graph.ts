const util = require('util')

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
}

interface Edge {
    vertex: Vertex
    weight: number;
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
        const startVertex = graph.vertices.find((vertex) => vertex.color === Colors.standard);

        if (!startVertex) break;

        const queue = [startVertex];

        while (queue.length > 0) {
            const vertex = queue.shift();

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

            process.stdout.write(`${edge.vertex.color}${edge.vertex.name}${Colors.standard}`);
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

        connectedComponents.push(graphComponent);
    }

    return connectedComponents;
}

function clearColors(graph: Graph) {
    graph.vertices.forEach((vertex) =>
        vertex.color = Colors.standard
    );
}

function main() {
    const g = createGraph();
    addVertices(g, ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    addEdge(g, "1", "3", 1);
    addEdge(g, "1", "9", 1);
    addEdge(g, "2", "3", 1);
    addEdge(g, "4", "6", 1);
    addEdge(g, "4", "8", 1);
    addEdge(g, "5", "6", 1);
    addEdge(g, "7", "8", 1);

    console.log("Grafo original")
    printGraph(g);
    console.log("------------------------------");

    const components = connectedComponents(g);

    components.forEach((graph, key) => {
        console.log(`Componente conexo número ${key + 1}`);
        printGraph(graph);
        console.log("------------------------------");
    });

}

main();