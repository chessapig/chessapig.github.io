class TriangleCoords {
    //takes in collection of 3 verticies !
    // and a p5.graphics object
    constructor(vertices) {
        this.vertices = vertices;

        this.halfplanes = [];
        for (let i = 0; i < 3; i++) {
            this.halfplanes.push(
                HalfPlane.fromPoints(vertices[(i + 1) % 3], vertices[(i + 2) % 3])
            )
        }

    }

    draw(graphics) {
        const ctx = graphics || window;

        ctx.push();
        ctx.noFill();
        ctx.beginShape();
        for (let v of this.vertices) {
            ctx.vertex(v.x, v.y);
        }
        ctx.endShape(CLOSE);
        ctx.pop();
    }

    //takes input point, and outputs barycentric coordinates
    screenToBarycentric(p) {
        let coords = [];
        for (let i = 0; i < 3; i++) {
            let h = this.halfplanes[i];
            let v = this.vertices[i];
            coords[i] = h.distance(p) / h.distance(v);
        }
        return coords;
    }

    //given array coords, return vec2 screen coordinates
    barycentricToScreen(coords) {
        let vs = this.vertices;
        let bary = createVector(0, 0);
        let totalCoords = 0;
        for (let i = 0; i < 3; i++) {
            totalCoords += coords[i];
        }
        for (let i = 0; i < 3; i++) {
            bary.add(vs[i].copy().mult(coords[i] / totalCoords));
        }
        return bary;
    }

    default(){
        let triVertices = [
            createVector(0, 0),
            createVector(0, 1),
            createVector(1, 0)
        ];
        return new TriangleCoords(triVertices);
    }

}

class HalfPlane {
    //p5 vector normal, float level
    constructor(normal, level) {
        this.normal = normal.copy().normalize();
        this.level = level;
    }

    //find intersection with other halfplane h
    intersect(h) {
        let v1 = this.normal;
        let c1 = this.level;
        let v2 = h.normal;
        let c2 = h.level;

        let det = abs(v1.x * v2.y - v1.y * v2.x);
        let x = v2.y * c1 - v1.y * c2;
        let y = -v2.x * c1 + v1.x * c2;
        return createVector(x / det, y / det);
    }

    //does hyperplane contain point?
    contains(p) {
        return (this.normal.dot(p) - this.level) < 0;
    }

    draw(len = 5) {
        let p = this.normal.copy().mult(this.level);
        let tangent = this.normal.copy().rotate(PI / 2).mult(len / 2);
        let p0 = p.copy().sub(tangent);
        let p1 = p.copy().add(tangent);
        line(p0.x, p0.y, p1.x, p1.y);
    }

    //distance to vector p
    distance(p) {
        return this.normal.dot(p) - this.level;
    }

    static fromPoints(p1, p2) {
        let normal = p1.copy().sub(p2).rotate(PI / 2).normalize();
        let level = p1.dot(normal);
        return new HalfPlane(normal, level);
    }
}