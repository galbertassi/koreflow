/**
 * Computes a CSS matrix3d that maps a rectangle (0,0, w,h) to 4 arbitrary points.
 * Points must be objects {x, y} representing the 4 corners:
 * pt1: Top-Left
 * pt2: Top-Right
 * pt3: Bottom-Right
 * pt4: Bottom-Left
 */

export function getPerspectiveTransform(w: number, h: number, p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }, p4: { x: number, y: number }) {
  // Solves a system of 8 linear equations to find the homography matrix
  const A = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [w, 0, 1, 0, 0, 0, -w * p2.x, 0],
    [0, 0, 0, w, 0, 1, -w * p2.y, 0],
    [w, h, 1, 0, 0, 0, -w * p3.x, -h * p3.x],
    [0, 0, 0, w, h, 1, -w * p3.y, -h * p3.y],
    [0, h, 1, 0, 0, 0, 0, -h * p4.x],
    [0, 0, 0, 0, h, 1, 0, -h * p4.y],
  ];

  const B = [
    p1.x, p1.y,
    p2.x, p2.y,
    p3.x, p3.y,
    p4.x, p4.y,
  ];

  const h_matrix = solve(A, B);

  if (!h_matrix) return "none";

  // Convert the 3x3 homography matrix to a 4x4 CSS transform matrix (COLUMN-MAJOR order)
  const H = [
    h_matrix[0], h_matrix[3], 0, h_matrix[6],
    h_matrix[1], h_matrix[4], 0, h_matrix[7],
    0, 0, 1, 0,
    h_matrix[2], h_matrix[5], 0, 1,
  ];

  return `matrix3d(${H.join(',')})`;
}

// Simple Gaussian elimination
function solve(A: number[][], B: number[]) {
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    for (let k = i; k < n; k++) {
      const tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }
    const tmp = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tmp;

    if (A[i][i] === 0) return null;

    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = B[i] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      B[k] -= A[k][i] * x[i];
    }
  }
  return x;
}
