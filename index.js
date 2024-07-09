const { readFileSync } = require('fs');

class ServicoCalculoFatura {

    calcularCredito(pecas, apre) {
        let creditos = 0;
        const peca = getPeca(pecas, apre);
        creditos += Math.max(apre.audiencia - 30, 0);
        if (peca.tipo === "comedia") 
            creditos += Math.floor(apre.audiencia / 5);
        return creditos;
    }
    
    calcularTotalCreditos(pecas, apresentacoes) {
        let creditos = 0;
        for (let apre of apresentacoes) {
            creditos += this.calcularCredito(pecas, apre);
        }
        return creditos;
    }
    
    calcularTotalApresentacao(pecas, apre) {
        let total = 0;
        const peca = getPeca(pecas, apre);
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
    
    calcularTotalFatura(pecas, apresentacoes) {
        let totalFatura = 0;
        for (let apre of apresentacoes) {
            totalFatura += this.calcularTotalApresentacao(pecas, apre);
        }
        return totalFatura;
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", 
        { style: "currency", currency: "BRL", 
          minimumFractionDigits: 2 }).format(valor / 100);
}

function getPeca(pecas, apresentacao) {
    return pecas[apresentacao.id];
}

function gerarFaturaStr(fatura, pecas, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
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
const pecas = JSON.parse(readFileSync('./pecas.json'));

const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);

// Comentar a chamada da função gerarFaturaHTML para simplificar a saída
// const faturaHTML = gerarFaturaHTML(faturas, pecas);
// console.log(faturaHTML);
