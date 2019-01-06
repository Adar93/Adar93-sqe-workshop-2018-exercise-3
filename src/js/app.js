import $ from 'jquery';
//import {parseCode} from './code-analyzer';
import {tableCreation,addEdges} from './code-analyzer';
import * as flowchart from 'flowchart.js';

function updateTable(tab){
    let ans = '';
    for (let i = 0; i<tab.length; i++) {
        if (tab[i].Code != null) {
            //{"Code":"let e = 7;","Color":null}
            ans = ans + '{"Vertex":"' + tab[i].Vertex + '","Code":"' + tab[i].Code + '","Type":"' + tab[i].Type + '"}'+'</br>';
            //ans = ans + tab[i].Code +'</br>';
        }
    }
    return ans;
}

function updateTable2(tab){
    let ans = '';
    for (let i = 0; i<tab.length; i++) {
        if (tab[i].Code != null) {
            //ans = ans + tab[i].Vertex + '\t' + tab[i].Code + '\t' + tab[i].Type +'</br>';
            ans = ans + tab[i].Code +'\n';
        }
    }
    return ans;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let inputVector = $('#inputVector').val();
        let codeToParse = $('#codePlaceholder').val();
        let tab = addEdges(tableCreation(codeToParse, inputVector));
        //$('#codePlaceholder').val(JSON.stringify(parseCode(codeToParse), null, 2));
        //$('#inputVector').val(JSON.stringify(parseCode(inputVector), null, 2));
        let HTMLtab = document.getElementById('presentation');
        HTMLtab.innerHTML = '';
        HTMLtab.innerHTML = updateTable(tab);
        let fc = flowchart.parse(updateTable2(tab));
        fc.drawSVG('presentation', {
            'yes-text': 'T',
            'no-text': 'F',
            'flowstate' : { 'in' : { 'fill' : '#adff2f'} }
        });
    });
});
