import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

function CodeRow (vertex, code, type){
    return {
        Vertex : vertex,
        Code : code,
        Type : type
    };
}

const Functions = {
    'IfStatement' : parseIf,
    'ElseIfStatement' : parseElseIf,
    'FunctionDeclaration' : parseFunc,
    'VariableDeclaration' : parseLet,
    'WhileStatement' : parseWhile,
    'ReturnStatement' : parseRet,
    'ExpressionStatement' : parseExp,
    'AssignmentExpression' : parseAssign,
    'BlockStatement': parseBlock,
    'Identifier' : parseIdentifier,
    'Literal' : parseLiteral,
    'BinaryExpression' : parseBinExpr,
    'LogicalExpression' : parseBinExpr,
    //'MemberExpression' : parseMember,
    'UnaryExpression' : parseUnary,
    'UpdateExpression': parseUpdate
};

function parseIdentifier(Exp,values){
    if (isInIfCond && values[Exp.name] != null)
        return values[Exp.name];
    return Exp.name;
}

function parseLiteral(Exp){
    return escodegen.generate(Exp);
}

function parseBinExpr(Exp,values,Table){
    let val, left, op, right;
    left = Functions[Exp.left.type](Exp.left,values,Table);
    right = Functions[Exp.right.type](Exp.right,values,Table);
    op = Exp.operator;
    if(isInIfCond && !(isNaN(left)) && !(isNaN(right)))
        val = eval(left + ' ' + op + ' ' + right);
    else
        val = left + ' ' + op + ' ' + right;
    return val;
}

function parseUnary(Exp,values,Table){
    let op, val;
    op = Exp.operator;
    val = Functions[Exp.argument.type](Exp.argument,values,Table);
    //return op + '(' + val + ')';
    return op + val;
}

function parseUpdate(Exp,values,Table){
    let op, val;
    op = Exp.operator;
    val = Functions[Exp.argument.type](Exp.argument,values,Table);
    //return op + '(' + val + ')';
    let code = val + op;
    if(newVertex) {
        counter++;
        code = 'op' + counter + '=>operation: '+'['+counter+']\n'+ code;
        newVertex = false;
    }
    let ver = 'op' + counter;
    let type = 'UpdateExpression';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

/*function checkInValues(i,arr,dictionary,values){
    let val;
    // arr is not a parameter
    if(!(isNaN(i)) && arr in values) {
        val = values[arr][i];
    }
    // arr is a parameter
    if(!(isNaN(i)) && arr in dictionary) {
        val = dictionary[arr][i];
    }
    /*else
        val = arr + '[' + i + ']';
    return val;
}*/

/*function parseMember(Exp,values,Table) {
    let arr, i, val;
    arr = escodegen.generate(Exp.object);
    i = Functions[Exp.property.type](Exp.property, values,Table);
    //only inside if condition
    if (isInIfCond && !(isNaN(i)) && arr in values)
        val = values[arr][i];
    // outside if - regular substitution
    /*else {
        if (!(isNaN(i)) && arr in dictionary) {
            val = dictionary[arr][i];
        }
        else
            val = arr + '[' + i + ']';
    }
    else
        val = arr + '[' + i + ']';
    return val;
}*/

function copyDictionaries(fromDict, toDict){
    Object.keys(fromDict).forEach(function(key) {
        toDict[key] = fromDict[key];
    });
}

function parseBlock(Body,values,Table){
    let values2 = {};
    copyDictionaries(values, values2);
    for (let i = 0; i<Body.body.length; i++)
        Functions[Body.body[i].type](Body.body[i],values,Table);
    copyDictionaries(values2, values);
}

function parseExp(Body,values,Table){
    return Functions[Body.expression.type](Body.expression,values,Table);
}

function updateValInArr(Exp,val2Show,val2Save,values,Table) {
    let arr, i;
    arr = escodegen.generate(Exp.object);
    i = Functions[Exp.property.type](Exp.property,values,Table);
    let name = arr + '[' + i + ']';
    //if(arr in values) {
    values[arr][i] = val2Save;
    let code = name + ' = ' + val2Show;
    /*if(newVertex) {
        counter++;
        code = 'op' + counter + '=>operation: '+'['+counter+']\n'+ code;
        newVertex = false;
    }*/
    let ver = 'op' + counter;
    let type = 'AssignmentExpression';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

function assignCode(name,val2Show,val2Save,values,Table) {
    values[name] = val2Save;
    let code = name + ' = ' + val2Show;
    if(newVertex) {
        counter++;
        code =  'op' + counter + '=>operation: '+'['+counter+']\n'+ code;
        newVertex = false;
    }
    let ver = 'op' + counter;
    let type = 'AssignmentExpression';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

function parseAssign(Body,values,Table){
    let name = escodegen.generate(Body.left);
    let val2Show = Functions[Body.right.type](Body.right,values,Table);
    isInIfCond = true;
    let val2Save = Functions[Body.right.type](Body.right,values,Table);
    isInIfCond = false;
    if (Body.left.type === 'MemberExpression'){
        updateValInArr(Body.left,val2Show,val2Save,values,Table);
    }
    else {
        assignCode(name,val2Show,val2Save,values,Table);
    }
}

function letCode(Body,Table){
    let enter = escodegen.generate(Body).indexOf(';');
    let code = escodegen.generate(Body).substr(4, enter - 4);
    if(newVertex){
        counter++;
        code = 'op'+counter+'=>operation: '+'['+counter+']\n'+ code;
        newVertex = false;
    }
    let ver = 'op' + counter;
    let type = 'VariableDeclaration';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

function parseLet(Body,values,Table){
    for (let i = 0; i<Body.declarations.length; i++) {
        let name = Body.declarations[i].id.name;
        let val = null;
        if (Body.declarations[i].init != null) {
            if (Body.declarations[i].init.type === 'ArrayExpression') {
                val = arrayParam(Body.declarations[i].init.elements);
                //values[name] = val;
                //val = '[' + val + ']';
            } else {
                isInIfCond = true;
                val = Functions[Body.declarations[i].init.type](Body.declarations[i].init, values,Table);
                isInIfCond = false;
                //values[name] = val;
            }
            values[name] = val;
        }
    }
    letCode(Body,Table);
}

function closeIf(ifCounter,Table) {
    newVertex = true;
    let code = 'e'+Number(ifCounter)+'=>end: null';
    let ver = 'e'+Number(ifCounter);
    let type = 'CloseIf';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

function parseAlternate(Body,values,Table) {
    if (Body.type === 'IfStatement')
        Functions['ElseIfStatement'](Body, values,Table);
    else{
        newVertex = true;
        Functions[Body.type](Body, values,Table);
    }
}
function parseCond(cond,values,Table){
    let Body = parseCode(cond);
    isInIfCond = true;
    let parsedCond = Functions[Body.body[0].expression.type](Body.body[0].expression,values,Table);
    isInIfCond = false;
    return eval(parsedCond);
}

function parseIf(Body,values,Table){
    Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    newVertex = true;
    let cond = Functions[Body.test.type](Body.test,values,Table);
    counter++;
    let ifCounter = counter;
    let code = 'cond'+counter+'=>condition: '+'['+counter+']\n'+ cond + ' | in';
    toColor = parseCond(cond,values);
    let ver = 'cond'+counter;
    let type = 'IfStatement';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
    Functions[Body.consequent.type](Body.consequent,values,Table);
    if (toColor) Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    if (Body.alternate != null) {
        parseAlternate(Body.alternate,values,Table);
        //if (!toColor) Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in'; toColor = true;
    }
    closeIf(ifCounter,Table);
}

function parseElseIf(Body,values,Table){
    //if (toColor) Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    newVertex = true;
    let cond = Functions[Body.test.type](Body.test,values,Table);
    counter++;
    let code = 'cond'+counter+'=>condition: '+'['+counter+']\n'+ cond + ' | in';
    toColor = parseCond(cond,values);
    let ver = 'cond'+counter;
    let type = 'ElseIfStatement';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
    Functions[Body.consequent.type](Body.consequent,values,Table);
    /*if (toColor) */Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    if (Body.alternate != null){
        parseAlternate(Body.alternate,values,Table);
        //if (!toColor) Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in'; toColor = true;
    }
}

function arrayParam(arrayInput){
    let arr = [];
    for (let i = 0; i<arrayInput.length; i++){
        arr[i] = escodegen.generate(arrayInput[i]);
    }
    return arr;
}

function funcParams(Body,values){
    for (let i = 0; i<Body.length; i++) {
        let name = escodegen.generate(Body[i]);
        let val;
        if( inputVector[i].type !== 'ArrayExpression')
            val = escodegen.generate(inputVector[i]);
        else
            val = arrayParam(inputVector[i].elements);
        values[name] = val;
    }
}

function parseFunc(Body,values,Table){
    newVertex = true;
    if (inputVector != null)
        funcParams(Body.params,values);
    Functions[Body.body.type](Body.body,values,Table);
}

function parseWhile(Body,values,Table){
    Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    newVertex = true;
    counter++;
    let whileCounter = counter;
    let code = 'e'+counter+'=>end: null' + ' | in';
    let ver = 'e'+counter;
    let type = 'WhileStatement';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
    let cond = Functions[Body.test.type](Body.test,values,Table);
    code = 'cond'+whileCounter+'=>condition: '+'['+counter+']\n'+ cond + ' | in';
    ver = 'cond'+whileCounter;
    type = 'WhileStatement';
    row = new CodeRow(ver, code, type);
    Table.push(row);
    Functions[Body.body.type](Body.body,values,Table);
}

function parseRet(Body,values,Table){
    Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    newVertex = true;
    let val = Functions[Body.argument.type](Body.argument,values,Table);
    counter++;
    let code = 'op'+counter+'=>operation: '+'['+counter+']\n'+'return ' + val;
    let ver = 'op' + counter;
    let type = 'ReturnStatement';
    let row = new CodeRow(ver, code, type);
    Table.push(row);
}

function loopBody(parsedCode){
    let values = {};
    counter = 0;
    newVertex = true;
    toColor = true;
    isInIfCond = false;
    Table = [];
    for (let i = 0; i<parsedCode.body.length; i++){
        Functions[parsedCode.body[i].type](parsedCode.body[i],values,Table);
        Table[Table.length-1].Code = Table[Table.length-1].Code + ' | in';
    }
    return Table;
}

let Table = [];
let inputVector;
let isInIfCond = false;
let counter = 0;
let newVertex = true;
let toColor = true;
function tableCreation(codeToParse, inVec){
    let parsedCode = parseCode(codeToParse);
    inputVector = parseCode(inVec);
    if (inputVector.body[0]!=null){
        //if(inputVector.body[0].expression.type === 'SequenceExpression')
        inputVector = inputVector.body[0].expression.expressions;
        //else inputVector = [inputVector.body[0].expression];
    }
    else (inputVector = null);
    return loopBody(parsedCode);
}

function addCodeOnly(code){
    let Table = [];
    let row = new CodeRow(null, code, null);
    Table.push(row);
    return Table;
}

function getNextVertex(tab,j){
    for (let i=j;i<tab.length-1; i++) {
        if(tab[i].Vertex !== tab[i+1].Vertex)
            return tab[i+1].Vertex;
    }
}

function addIfEdges(tab,i) {
    let Table = [];
    if (isInIf === 0)
        isInIf = tab[i].Vertex.substr(4, 1);
    Table = Table.concat(addCodeOnly(tab[i].Vertex + '(yes)->' + tab[i + 1].Vertex));
    Table = Table.concat(addCodeOnly(tab[i].Vertex + '(no)->' + getNextVertex(tab, i + 1)));
    if (tab[i].Type !== 'WhileStatement') {
        //if (tab[i + 1].Vertex.substr(0, 2) === 'op') {
        Table = Table.concat(addCodeOnly(tab[i + 1].Vertex + '->e' + isInIf));
        //}
        if (getNextVertex(tab, i + 1).substr(0, 2) === 'op') {
            Table = Table.concat(addCodeOnly(getNextVertex(tab, i + 1) + '->e' + isInIf));
        }
    }
    else{
        Table = Table.concat(addCodeOnly(tab[i + 1].Vertex + '->e' + isInIf));
    }
    return Table;
}

function analyzeRow2(tab,i){
    let Table = [];
    if(/*isInIf!==0 &&*/ tab[i].Vertex.substr(0,1)==='e'){
        Table = Table.concat(addCodeOnly(tab[i].Vertex + '->' + tab[i+1].Vertex));
        isInIf=0;
    }
    else if(tab[i].Vertex.substr(0,4)==='cond'){
        Table = Table.concat(addIfEdges(tab,i));
    }
    return Table;
}

function analyzeRow(tab,i){
    let Table = [];
    // regular vertex
    if(isInIf===0 && tab[i].Vertex.substr(0,2)==='op' && tab[i].Vertex !== tab[i+1].Vertex){
        Table = Table.concat(addCodeOnly(tab[i].Vertex + '->' + tab[i+1].Vertex));
    }
    else
        Table = Table.concat(analyzeRow2(tab,i));
    return Table;
}

let isInIf=0;
function addEdges(tab){
    let Table = [];
    isInIf = 0;
    for (let i = 0; i<tab.length-1; i++) {
        if(tab[i].Vertex !== tab[i+1].Vertex)
            Table = Table.concat(analyzeRow(tab,i));
    }
    tab = tab.concat(Table);
    return tab;
}

function resetParams(){
    counter = 0;
    newVertex = true;
    toColor = true;
    isInIfCond = false;
}

export {addEdges, parseCode, tableCreation, parseAssign, parseLet, parseIf, parseWhile, parseFunc, resetParams};
