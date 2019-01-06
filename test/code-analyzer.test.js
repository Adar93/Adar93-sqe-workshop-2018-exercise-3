import assert from 'assert';
import {
    parseCode,
    tableCreation,
    parseAssign,
    parseLet,
    resetParams,
    addEdges
} from '../src/js/code-analyzer';

let values = {x:1, y:2, z:3,  n:[0,1]};
let Table = [];

describe('Let parser', () => {
    it('is parsing a simple variable declaration correctly', () => {
        parseLet(parseCode('let e = 7;').body[0],values,Table);
        assert.deepEqual(JSON.stringify(Table),'[{"Vertex":"op1","Code":"op1=>operation: [1]\\ne = 7","Type":"VariableDeclaration"}]');
        Table = [];
        resetParams();
    });
    it('is parsing a variable declaration for array correctly', () => {
        parseLet(parseCode('let e = [1,2,3];').body[0],values,Table);
        assert.deepEqual(JSON.stringify(Table),'[{"Vertex":"op1","Code":"op1=>operation: [1]\\ne = [\\n    1,\\n    2,\\n    3\\n]","Type":"VariableDeclaration"}]');        Table = [];
        Table = [];
        resetParams();
    });
});

describe('Assign parser', () => {
    it('is parsing a simple Assignment correctly', () => {
        parseAssign(parseCode('x = 7;').body[0].expression,values,Table);
        assert.deepEqual(JSON.stringify(Table),'[{"Vertex":"op1","Code":"op1=>operation: [1]\\nx = 7","Type":"AssignmentExpression"}]');
        Table = [];
        resetParams();
    });
    it('is updating the values for a simple Assignment correctly', () => {
        parseAssign(parseCode('a = 7;').body[0].expression,values,Table);
        assert.ok(values.a === '7');
        Table = [];
        resetParams();
    });
});

describe('If parser', () => {
    it('is parsing an if statement correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(x, y, z){\n' +
            '    let a = 1\n' +
            '    if (true) {\n' +
            '        x=y;\n' +
            '    }\n' +
            '}\n','1,2,3'))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = 1 | in","Type":"VariableDeclaration"},{"Vertex":"cond2","Code":"cond2=>condition: [2]\\ntrue | in","Type":"IfStatement"},{"Vertex":"op3","Code":"op3=>operation: [3]\\nx = y | in","Type":"AssignmentExpression"},{"Vertex":"e2","Code":"e2=>end: null | in","Type":"CloseIf"},{"Vertex":null,"Code":"op1->cond2","Type":null},{"Vertex":null,"Code":"cond2(yes)->op3","Type":null},{"Vertex":null,"Code":"cond2(no)->e2","Type":null},{"Vertex":null,"Code":"op3->e2","Type":null}]'
        );
    });
});

describe('While parser', () => {
    it('is parsing a complex if statement correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    }' + '    \n' +
                '    return c;\n' + '}\n','1,2,3'))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = x + 1","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"b = a + y","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"c = 0 | in","Type":"VariableDeclaration"},{"Vertex":"cond2","Code":"cond2=>condition: [2]\\nb < z | in","Type":"IfStatement"},{"Vertex":"op3","Code":"op3=>operation: [3]\\nc = c + 5","Type":"AssignmentExpression"},{"Vertex":"cond4","Code":"cond4=>condition: [4]\\nb < z * 2 | in","Type":"ElseIfStatement"},{"Vertex":"op5","Code":"op5=>operation: [5]\\nc = c + x + 5 | in","Type":"AssignmentExpression"},{"Vertex":"e2","Code":"e2=>end: null | in","Type":"CloseIf"},{"Vertex":"op6","Code":"op6=>operation: [6]\\nreturn c | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->cond2","Type":null},{"Vertex":null,"Code":"cond2(yes)->op3","Type":null},{"Vertex":null,"Code":"cond2(no)->cond4","Type":null},{"Vertex":null,"Code":"op3->e2","Type":null},{"Vertex":null,"Code":"cond4(yes)->op5","Type":null},{"Vertex":null,"Code":"cond4(no)->e2","Type":null},{"Vertex":null,"Code":"op5->e2","Type":null},{"Vertex":null,"Code":"e2->op6","Type":null}]'
        );
    });
});

describe('While parser', () => {
    it('is parsing a complex if statement correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' + '    \n' +
                '    return c;\n' + '}\n','1,2,3'))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = x + 1","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"b = a + y","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"c = 0 | in","Type":"VariableDeclaration"},{"Vertex":"cond2","Code":"cond2=>condition: [2]\\nb < z | in","Type":"IfStatement"},{"Vertex":"op3","Code":"op3=>operation: [3]\\nc = c + 5","Type":"AssignmentExpression"},{"Vertex":"cond4","Code":"cond4=>condition: [4]\\nb < z * 2 | in","Type":"ElseIfStatement"},{"Vertex":"op5","Code":"op5=>operation: [5]\\nc = c + x + 5 | in","Type":"AssignmentExpression"},{"Vertex":"op6","Code":"op6=>operation: [6]\\nc = c + z + 5","Type":"AssignmentExpression"},{"Vertex":"e2","Code":"e2=>end: null | in","Type":"CloseIf"},{"Vertex":"op7","Code":"op7=>operation: [7]\\nreturn c | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->cond2","Type":null},{"Vertex":null,"Code":"cond2(yes)->op3","Type":null},{"Vertex":null,"Code":"cond2(no)->cond4","Type":null},{"Vertex":null,"Code":"op3->e2","Type":null},{"Vertex":null,"Code":"cond4(yes)->op5","Type":null},{"Vertex":null,"Code":"cond4(no)->op6","Type":null},{"Vertex":null,"Code":"op5->e2","Type":null},{"Vertex":null,"Code":"op6->e2","Type":null},{"Vertex":null,"Code":"e2->op7","Type":null}]'
        );
    });
});

describe('While parser', () => {
    it('is parsing an a while loop correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       c = a + b;\n' +
                '       z = c * 2;\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n','1,2,3'))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = x + 1","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"b = a + y","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"c = 0 | in","Type":"VariableDeclaration"},{"Vertex":"e2","Code":"e2=>end: null | in","Type":"WhileStatement"},{"Vertex":"cond2","Code":"cond2=>condition: [2]\\na < z | in","Type":"WhileStatement"},{"Vertex":"op3","Code":"op3=>operation: [3]\\nc = a + b","Type":"AssignmentExpression"},{"Vertex":"op3","Code":"z = c * 2","Type":"AssignmentExpression"},{"Vertex":"op3","Code":"a++ | in","Type":"UpdateExpression"},{"Vertex":"op4","Code":"op4=>operation: [4]\\nreturn z | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->e2","Type":null},{"Vertex":null,"Code":"e2->cond2","Type":null},{"Vertex":null,"Code":"cond2(yes)->op3","Type":null},{"Vertex":null,"Code":"cond2(no)->op4","Type":null},{"Vertex":null,"Code":"op3->e2","Type":null}]'
        );
    });
});

describe('func parser', () => {
    it('is parsing a function with no parameters correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(){\n' +
                '   let a = 3;\n' +
                '   return a;\n' +
                '}',''))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = 3 | in","Type":"VariableDeclaration"},{"Vertex":"op2","Code":"op2=>operation: [2]\\nreturn a | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->op2","Type":null}]'
        );
    });
    it('is parsing a function with one parameter correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(a){\n' +
                '   a = 3;\n' +
                '   return a;\n' +
                '}',''))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = 3 | in","Type":"AssignmentExpression"},{"Vertex":"op2","Code":"op2=>operation: [2]\\nreturn a | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->op2","Type":null}]'
        );
    });
});

describe('While parser', () => {
    it('is parsing an a while loop correctly', () => {
        assert.deepEqual(
            JSON.stringify(addEdges(tableCreation('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = [ 0, 1 ];\n' +
                '   let c;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       a++;\n' +
                'c=-3;\n' +
                'b[0]=1;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n','1,[0,1],3'))),
            '[{"Vertex":"op1","Code":"op1=>operation: [1]\\na = x + 1","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"b = [\\n    0,\\n    1\\n]","Type":"VariableDeclaration"},{"Vertex":"op1","Code":"c | in","Type":"VariableDeclaration"},{"Vertex":"e2","Code":"e2=>end: null | in","Type":"WhileStatement"},{"Vertex":"cond2","Code":"cond2=>condition: [2]\\na < z | in","Type":"WhileStatement"},{"Vertex":"op3","Code":"op3=>operation: [3]\\na++","Type":"UpdateExpression"},{"Vertex":"op3","Code":"c = -3","Type":"AssignmentExpression"},{"Vertex":"op3","Code":"b[0] = 1 | in","Type":"AssignmentExpression"},{"Vertex":"op4","Code":"op4=>operation: [4]\\nreturn z | in","Type":"ReturnStatement"},{"Vertex":null,"Code":"op1->e2","Type":null},{"Vertex":null,"Code":"e2->cond2","Type":null},{"Vertex":null,"Code":"cond2(yes)->op3","Type":null},{"Vertex":null,"Code":"cond2(no)->op4","Type":null},{"Vertex":null,"Code":"op3->e2","Type":null}]'
        );
    });
});
