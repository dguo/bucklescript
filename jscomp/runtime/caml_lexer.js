// Generated CODE, PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("./caml_builtin_exceptions");

function fail() {
  throw [
        Caml_builtin_exceptions.failure,
        "lexing: empty token"
      ];
}

 
function caml_lex_array(s) {
    var l = s.length / 2;
    var a = new Array(l);
    // when s.charCodeAt(2 * i + 1 ) > 128 (0x80)
    // a[i] < 0  
    // for(var i = 0 ; i <= 0xffff; ++i) { if (i << 16 >> 16 !==i){console.log(i<<16>>16, 'vs',i)}}
    // 
    for (var i = 0; i < l; i++)
        a[i] = (s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8)) << 16 >> 16;
    return a;
}
/**
 * external c_engine  : lex_tables -> int -> lexbuf -> int
 * lexing.ml
 * type lex_tables = {
 *   lex_base : string;
 *   lex_backtrk : string;
 *   lex_default : string;
 *   lex_trans : string;
 *   lex_check : string;
 *   lex_base_code : string;
 *   lex_backtrk_code : string;
 *   lex_default_code : string;
 *   lex_trans_code : string;
 *   lex_check_code : string;
 *   lex_code : string;
 * }
 *
 * type lexbuf = {
 *   refill_buff : lexbuf -> unit ;
 *   mutable lex_buffer : bytes;
 *   mutable lex_buffer_len : int;
 *   mutable lex_abs_pos : int;
 *   mutable lex_start_pos : int;
 *   mutable lex_curr_pos : int;
 *   mutable lex_last_pos : int;
 *   mutable lex_last_action : int;
 *   mutable lex_eof_reached : bool;
 *   mutable lex_mem : int array;
 *   mutable lex_start_p : position;
 *   mutable lex_curr_p;
 * }
 * @param tbl
 * @param start_state
 * @param lexbuf
 * @returns {any}
 */
function $$caml_lex_engine(tbl, start_state, lexbuf) {
    // Lexing.lexbuf
    var lex_buffer = 1;
    var lex_buffer_len = 2;
    var lex_start_pos = 4;
    var lex_curr_pos = 5;
    var lex_last_pos = 6;
    var lex_last_action = 7;
    var lex_eof_reached = 8;
    // Lexing.lex_tables
    var lex_base = 0;
    var lex_backtrk = 1;
    var lex_default = 2;
    var lex_trans = 3;
    var lex_check = 4;
    if (!tbl.lex_default) {
        tbl.lex_base = caml_lex_array(tbl[lex_base]);
        tbl.lex_backtrk = caml_lex_array(tbl[lex_backtrk]);
        tbl.lex_check = caml_lex_array(tbl[lex_check]);
        tbl.lex_trans = caml_lex_array(tbl[lex_trans]);
        tbl.lex_default = caml_lex_array(tbl[lex_default]);
    }
    var c;
    var state = start_state;
    //var buffer = bytes_of_string(lexbuf[lex_buffer]);
    var buffer = lexbuf[lex_buffer];
    if (state >= 0) {
        /* First entry */
        lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
        lexbuf[lex_last_action] = -1;
    }
    else {
        /* Reentry after refill */
        state = -state - 1;
    }
    for (;;) {
        /* Lookup base address or action number for current state */
        var base = tbl.lex_base[state];
        if (base < 0)
            return -base - 1;
        /* See if it's a backtrack point */
        var backtrk = tbl.lex_backtrk[state];
        if (backtrk >= 0) {
            lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
            lexbuf[lex_last_action] = backtrk;
        }
        /* See if we need a refill */
        if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]) {
            if (lexbuf[lex_eof_reached] === 0)
                return -state - 1;
            else
                c = 256;
        }
        else {
            /* Read next input char */
            c = buffer[lexbuf[lex_curr_pos]];
            lexbuf[lex_curr_pos]++;
        }
        /* Determine next state */
        if (tbl.lex_check[base + c] === state) {
            state = tbl.lex_trans[base + c];
        }
        else {
            state = tbl.lex_default[state];
        }
        /* If no transition on this char, return to last backtrack point */
        if (state < 0) {
            lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
            if (lexbuf[lex_last_action] == -1)
                fail();
            else
                return lexbuf[lex_last_action];
        }
        else {
            /* Erase the EOF condition only if the EOF pseudo-character was
             consumed by the automaton (i.e. there was no backtrack above)
             */
            if (c == 256)
                lexbuf[lex_eof_reached] = 0;
        }
    }
}

/***********************************************/
/* New lexer engine, with memory of positions  */
/***********************************************/
function caml_lex_run_mem(s, i, mem, curr_pos) {
    for (;;) {
        var dst = s.charCodeAt(i);
        i++;
        if (dst == 0xff)
            return;
        var src = s.charCodeAt(i);
        i++;
        if (src == 0xff)
            mem[dst + 1] = curr_pos;
        else
            mem[dst + 1] = mem[src + 1];
    }
}
function caml_lex_run_tag(s, i, mem) {
    for (;;) {
        var dst = s.charCodeAt(i);
        i++;
        if (dst == 0xff)
            return;
        var src = s.charCodeAt(i);
        i++;
        if (src == 0xff)
            mem[dst + 1] = -1;
        else
            mem[dst + 1] = mem[src + 1];
    }
}
/**
 * external c_new_engine : lex_tables -> int -> lexbuf -> int = "caml_new_lex_engine"
 * @param tbl
 * @param start_state
 * @param lexbuf
 * @returns {any}
 */
function $$caml_new_lex_engine(tbl, start_state, lexbuf) {
    // Lexing.lexbuf
    var lex_buffer = 1;
    var lex_buffer_len = 2;
    var lex_start_pos = 4;
    var lex_curr_pos = 5;
    var lex_last_pos = 6;
    var lex_last_action = 7;
    var lex_eof_reached = 8;
    var lex_mem = 9;
    // Lexing.lex_tables
    var lex_base = 0;
    var lex_backtrk = 1;
    var lex_default = 2;
    var lex_trans = 3;
    var lex_check = 4;
    var lex_base_code = 5;
    var lex_backtrk_code = 6;
    var lex_default_code = 7;
    var lex_trans_code = 8;
    var lex_check_code = 9;
    var lex_code = 10;
    if (!tbl.lex_default) {
        tbl.lex_base = caml_lex_array(tbl[lex_base]);
        tbl.lex_backtrk = caml_lex_array(tbl[lex_backtrk]);
        tbl.lex_check = caml_lex_array(tbl[lex_check]);
        tbl.lex_trans = caml_lex_array(tbl[lex_trans]);
        tbl.lex_default = caml_lex_array(tbl[lex_default]);
    }
    if (!tbl.lex_default_code) {
        tbl.lex_base_code = caml_lex_array(tbl[lex_base_code]);
        tbl.lex_backtrk_code = caml_lex_array(tbl[lex_backtrk_code]);
        tbl.lex_check_code = caml_lex_array(tbl[lex_check_code]);
        tbl.lex_trans_code = caml_lex_array(tbl[lex_trans_code]);
        tbl.lex_default_code = caml_lex_array(tbl[lex_default_code]);
    }
    if (tbl.lex_code == null) {
        //tbl.lex_code = caml_bytes_of_string(tbl[lex_code]);
        tbl.lex_code = (tbl[lex_code]);
    }
    var c, state = start_state;
    //var buffer = caml_bytes_of_string(lexbuf[lex_buffer]);
    var buffer = lexbuf[lex_buffer];
    if (state >= 0) {
        /* First entry */
        lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
        lexbuf[lex_last_action] = -1;
    }
    else {
        /* Reentry after refill */
        state = -state - 1;
    }
    for (;;) {
        /* Lookup base address or action number for current state */
        var base = tbl.lex_base[state];
        if (base < 0) {
            var pc_off = tbl.lex_base_code[state];
            caml_lex_run_tag(tbl.lex_code, pc_off, lexbuf[lex_mem]);
            return -base - 1;
        }
        /* See if it's a backtrack point */
        var backtrk = tbl.lex_backtrk[state];
        if (backtrk >= 0) {
            var pc_off = tbl.lex_backtrk_code[state];
            caml_lex_run_tag(tbl.lex_code, pc_off, lexbuf[lex_mem]);
            lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
            lexbuf[lex_last_action] = backtrk;
        }
        /* See if we need a refill */
        if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]) {
            if (lexbuf[lex_eof_reached] == 0)
                return -state - 1;
            else
                c = 256;
        }
        else {
            /* Read next input char */
            c = buffer[lexbuf[lex_curr_pos]];
            lexbuf[lex_curr_pos]++;
        }
        /* Determine next state */
        var pstate = state;
        if (tbl.lex_check[base + c] == state)
            state = tbl.lex_trans[base + c];
        else
            state = tbl.lex_default[state];
        /* If no transition on this char, return to last backtrack point */
        if (state < 0) {
            lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
            if (lexbuf[lex_last_action] == -1)
                fail();
            else
                return lexbuf[lex_last_action];
        }
        else {
            /* If some transition, get and perform memory moves */
            var base_code = tbl.lex_base_code[pstate], pc_off;
            if (tbl.lex_check_code[base_code + c] == pstate)
                pc_off = tbl.lex_trans_code[base_code + c];
            else
                pc_off = tbl.lex_default_code[pstate];
            if (pc_off > 0)
                caml_lex_run_mem(tbl.lex_code, pc_off, lexbuf[lex_mem], lexbuf[lex_curr_pos]);
            /* Erase the EOF condition only if the EOF pseudo-character was
             consumed by the automaton (i.e. there was no backtrack above)
             */
            if (c == 256)
                lexbuf[lex_eof_reached] = 0;
        }
    }
}

;

function caml_lex_engine(prim, prim$1, prim$2) {
  return $$caml_lex_engine(prim, prim$1, prim$2);
}

function caml_new_lex_engine(prim, prim$1, prim$2) {
  return $$caml_new_lex_engine(prim, prim$1, prim$2);
}

exports.fail                = fail;
exports.caml_lex_engine     = caml_lex_engine;
exports.caml_new_lex_engine = caml_new_lex_engine;
/*  Not a pure module */