// Generar inputs al cargar la página
window.onload = () => generateMatrices();

function generateMatrices() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    
    createGrid('matrix-A', rows, cols, 'A');
    createGrid('matrix-B', rows, cols, 'B');
}

function createGrid(containerId, rows, cols, prefix) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `${prefix}-${i}-${j}`;
            input.value = '0';
            container.appendChild(input);
        }
    }
}

function getMatrixValues(prefix) {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    let matrix = [];
    
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            const val = parseFloat(document.getElementById(`${prefix}-${i}-${j}`).value);
            row.push(isNaN(val) ? 0 : val);
        }
        matrix.push(row);
    }
    return matrix;
}

function printMatrixResult(matrix) {
    const cols = matrix[0].length;
    let html = `<div class="matrix-result" style="grid-template-columns: repeat(${cols}, 60px)">`;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < cols; j++) {
            // Redondea a 2 decimales para evitar problemas de coma flotante
            let num = Math.round(matrix[i][j] * 100) / 100;
            html += `<span>${num}</span>`;
        }
    }
    html += '</div>';
    document.getElementById('result-content').innerHTML = html;
}

function calculate(operation) {
    const A = getMatrixValues('A');
    const B = getMatrixValues('B');
    const rows = A.length;
    const cols = A[0].length;
    let result = [];

    if (operation === 'add' || operation === 'subtract') {
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push(operation === 'add' ? A[i][j] + B[i][j] : A[i][j] - B[i][j]);
            }
            result.push(row);
        }
        printMatrixResult(result);
    } 
    
    else if (operation === 'multiply') {
        // Multiplicación estándar matricial A x B (requiere filas A = cols B, aquí asumimos dimensiones iguales por simplicidad del layout grid estático)
        if (cols !== rows) {
            document.getElementById('result-content').innerText = "Para multiplicar, Columnas de A debe igualar a Filas de B (Prueba con matrices cuadradas).";
            return;
        }
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                let sum = 0;
                for (let k = 0; k < cols; k++) {
                    sum += A[i][k] * B[k][j];
                }
                row.push(sum);
            }
            result.push(row);
        }
        printMatrixResult(result);
    }
}

function unilateral(operation) {
    const A = getMatrixValues('A');
    const rows = A.length;
    const cols = A[0].length;

    if (rows !== cols) {
        document.getElementById('result-content').innerText = "La matriz debe ser cuadrada (ej. 2x2, 3x3).";
        return;
    }

    if (operation === 'detA') {
        const d = determinant(A);
        document.getElementById('result-content').innerHTML = `<strong>Determinante de A:</strong> ${Math.round(d * 100) / 100}`;
    } else if (operation === 'invA') {
        const inv = inverse(A);
        if (!inv) {
            document.getElementById('result-content').innerText = "La matriz no tiene inversa (Determinante es 0).";
        } else {
            printMatrixResult(inv);
        }
    }
}

// Función recursiva para Determinantes
function determinant(m) {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][2] ? m[0][0] * m[1][1] - m[0][1] * m[1][0] : m[0][0] * m[1][1] - m[0][1] * m[1][0];
    
    let det = 0;
    for (let j = 0; j < m.length; j++) {
        let subMatrix = m.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
        det += Math.pow(-1, j) * m[0][j] * determinant(subMatrix);
    }
    return det;
}

// Función para obtener matriz inversa (Método de Gauss-Jordan básico)
function inverse(m) {
    let det = determinant(m);
    if (det === 0) return null;
    
    let n = m.length;
    let identity = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i === j ? 1 : 0));
    let clone = m.map(row => [...row]);

    for (let i = 0; i < n; i++) {
        let e = clone[i][i];
        if (e === 0) {
            // Intercambio simple de filas si encuentra un cero en la diagonal
            for (let ii = i + 1; ii < n; ii++) {
                if (clone[ii][i] !== 0) {
                    [clone[i], clone[ii]] = [clone[ii], clone[i]];
                    [identity[i], identity[ii]] = [identity[ii], identity[i]];
                    e = clone[i][i];
                    break;
                }
            }
        }
        
        for (let j = 0; j < n; j++) {
            clone[i][j] /= e;
            identity[i][j] /= e;
        }
        
        for (let ii = 0; ii < n; ii++) {
            if (ii !== i) {
                let factor = clone[ii][i];
                for (let j = 0; j < n; j++) {
                    clone[ii][j] -= factor * clone[i][j];
                    identity[ii][j] -= factor * identity[i][j];
                }
            }
        }
    }
    return identity;
}

function clearAll() {
    generateMatrices();
    document.getElementById('result-content').innerText = "Los resultados aparecerán aquí.";
}
