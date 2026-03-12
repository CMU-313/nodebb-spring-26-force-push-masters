J$.iids = {"9":[6,10,6,11],"10":[6,10,6,15],"17":[6,14,6,15],"18":[9,10,9,31],"25":[6,10,6,15],"26":[14,13,14,21],"33":[6,3,6,16],"34":[14,23,14,31],"41":[5,1,7,2],"49":[5,1,7,2],"57":[5,1,7,2],"65":[5,1,7,2],"73":[9,10,9,16],"81":[9,17,9,18],"89":[9,10,9,19],"97":[9,22,9,28],"105":[9,29,9,30],"113":[9,22,9,31],"121":[9,10,9,31],"129":[9,3,9,32],"137":[8,1,10,2],"145":[8,1,10,2],"153":[8,1,10,2],"161":[8,1,10,2],"169":[11,9,11,12],"177":[11,13,11,14],"185":[11,16,11,17],"193":[11,9,11,18],"201":[11,9,11,18],"209":[11,9,11,18],"217":[12,9,12,15],"225":[12,16,12,23],"233":[12,25,12,33],"241":[12,9,12,34],"249":[12,9,12,34],"257":[12,9,12,34],"265":[13,16,13,19],"273":[13,20,13,21],"281":[13,23,13,32],"289":[13,16,13,33],"297":[13,16,13,33],"305":[13,16,13,33],"313":[14,1,14,8],"321":[14,13,14,17],"329":[14,20,14,21],"337":[14,23,14,27],"345":[14,30,14,31],"353":[14,1,14,32],"355":[14,1,14,12],"361":[14,1,14,33],"369":[1,1,15,1],"377":[5,1,7,2],"385":[1,1,15,1],"393":[8,1,10,2],"401":[1,1,15,1],"409":[1,1,15,1],"417":[1,1,15,1],"425":[1,1,15,1],"433":[5,1,7,2],"441":[5,1,7,2],"449":[8,1,10,2],"457":[8,1,10,2],"465":[1,1,15,1],"473":[1,1,15,1],"nBranches":0,"originalCodeFileName":"/workspaces/nodebb-spring-26-force-push-masters/tools/jalangi-target.js","instrumentedCodeFileName":"/workspaces/nodebb-spring-26-force-push-masters/tools/jalangi-target_jalangi_.js","code":"/**\n * Small target script for Jalangi2 dynamic analysis (Project 3A tool evaluation).\n * ES5-friendly so Jalangi can instrument it; exercises basic operations for CheckNaN etc.\n */\nfunction add(a, b) {\n  return a + b;\n}\nfunction concat(x, y) {\n  return String(x) + String(y);\n}\nvar n = add(1, 2);\nvar s = concat(\"hello\", \" world\");\nvar maybeNaN = add(1, undefined);\nconsole.log(\"n=\" + n, \"s=\" + s);\n"};
jalangiLabel2:
    while (true) {
        try {
            J$.Se(369, '/workspaces/nodebb-spring-26-force-push-masters/tools/jalangi-target_jalangi_.js', '/workspaces/nodebb-spring-26-force-push-masters/tools/jalangi-target.js');
            function add(a, b) {
                jalangiLabel0:
                    while (true) {
                        try {
                            J$.Fe(41, arguments.callee, this, arguments);
                            arguments = J$.N(49, 'arguments', arguments, 4);
                            a = J$.N(57, 'a', a, 4);
                            b = J$.N(65, 'b', b, 4);
                            return J$.X1(33, J$.Rt(25, J$.B(10, '+', J$.R(9, 'a', a, 0), J$.R(17, 'b', b, 0), 0)));
                        } catch (J$e) {
                            J$.Ex(433, J$e);
                        } finally {
                            if (J$.Fr(441))
                                continue jalangiLabel0;
                            else
                                return J$.Ra();
                        }
                    }
            }
            function concat(x, y) {
                jalangiLabel1:
                    while (true) {
                        try {
                            J$.Fe(137, arguments.callee, this, arguments);
                            arguments = J$.N(145, 'arguments', arguments, 4);
                            x = J$.N(153, 'x', x, 4);
                            y = J$.N(161, 'y', y, 4);
                            return J$.X1(129, J$.Rt(121, J$.B(18, '+', J$.F(89, J$.R(73, 'String', String, 2), 0)(J$.R(81, 'x', x, 0)), J$.F(113, J$.R(97, 'String', String, 2), 0)(J$.R(105, 'y', y, 0)), 0)));
                        } catch (J$e) {
                            J$.Ex(449, J$e);
                        } finally {
                            if (J$.Fr(457))
                                continue jalangiLabel1;
                            else
                                return J$.Ra();
                        }
                    }
            }
            add = J$.N(385, 'add', J$.T(377, add, 12, false, 41), 0);
            concat = J$.N(401, 'concat', J$.T(393, concat, 12, false, 137), 0);
            J$.N(409, 'n', n, 0);
            J$.N(417, 's', s, 0);
            J$.N(425, 'maybeNaN', maybeNaN, 0);
            var n = J$.X1(209, J$.W(201, 'n', J$.F(193, J$.R(169, 'add', add, 1), 0)(J$.T(177, 1, 22, false), J$.T(185, 2, 22, false)), n, 3));
            var s = J$.X1(257, J$.W(249, 's', J$.F(241, J$.R(217, 'concat', concat, 1), 0)(J$.T(225, "hello", 21, false), J$.T(233, " world", 21, false)), s, 3));
            var maybeNaN = J$.X1(305, J$.W(297, 'maybeNaN', J$.F(289, J$.R(265, 'add', add, 1), 0)(J$.T(273, 1, 22, false), J$.T(281, undefined, 24, false)), maybeNaN, 3));
            J$.X1(361, J$.M(353, J$.R(313, 'console', console, 2), 'log', 0)(J$.B(26, '+', J$.T(321, "n=", 21, false), J$.R(329, 'n', n, 1), 0), J$.B(34, '+', J$.T(337, "s=", 21, false), J$.R(345, 's', s, 1), 0)));
        } catch (J$e) {
            J$.Ex(465, J$e);
        } finally {
            if (J$.Sr(473)) {
                J$.L();
                continue jalangiLabel2;
            } else {
                J$.L();
                break jalangiLabel2;
            }
        }
    }
// JALANGI DO NOT INSTRUMENT
