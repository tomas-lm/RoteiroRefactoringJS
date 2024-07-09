const { readFileSync } = require('fs');

class Repositorio {
    constructor() {
        this.pecas = JSON.parse(readFileSync('./pecas.json'));
    }

    getPeca(apre) {
        return this.pecas[apre.id];
    }
}

class ServicoCalculoFatura {
    constructor(repo) {
        this.repo = repo;
    }

    calcularCredito(apre) {
        let creditos = 0;
        const peca = this.repo.getPeca(apre);
        creditos += Math.max(apre.audiencia - 30, 0);
        if (peca.tipo === "comedia") 
            creditos += Math.floor(apre.audiencia / 5);
        return creditos;
    }
    
    calcularTotalCreditos(apresentacoes) {
        let creditos = 0;
        for (let apre of apresentacoes) {
            creditos += this.calcularCredito(apre);
        }
        return creditos;
    }
    
    calcularTotalApresentacao(apre) {
        let total = 0;
        const peca = this.repo.getPeca(apre);
        switch (peca.tipo) {
            case "tragedia":
                total = 40000;
                if (apre.audiencia > 30) {
                    total += 1000 * (apre.audiencia - 30);
                }
                break;
            case "comedia":
                total = 30000;
                if (apre.audiencia > 20) {
                    total += 10000 + 500 * (apre.audiencia - 20);
                }
                total += 300 * apre.audiencia;
                break;
            default:
                throw new Error(`Peça desconhecida: ${peca.tipo}`);
        }
        return total;
    }
    
    calcularTotalFatura(apresentacoes) {
        let totalFatura = 0;
        for (let apre of apresentacoes) {
            totalFatura += this.calcularTotalApresentacao(apre);
        }
        return totalFatura;
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", 
        { style: "currency", currency: "BRL", 
          minimumFractionDigits: 2 }).format(valor / 100);
}

function gerarFaturaStr(fatura, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
    return faturaStr;
}

// Comentar a função gerarFaturaHTML para simplificar a saída
// function gerarFaturaHTML(fatura, pecas) {
//     let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;
//     for (let apre of fatura.apresentacoes) {
//         faturaHTML += `<li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
//     }
//     faturaHTML += `</ul>\n<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
//     faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n</html>`;
//     return faturaHTML;
// }

const faturas = JSON.parse(readFileSync('./faturas.json'));

const repo = new Repositorio();
const calc = new ServicoCalculoFatura(repo);
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);

// Comentar a chamada da função gerarFaturaHTML para simplificar a saída
// const faturaHTML = gerarFaturaHTML(faturas, pecas);
// console.log(faturaHTML);
