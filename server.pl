:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_files)).

% Memulai server
start_server :-
    http_server(http_dispatch, [port(1111)]).

% Server HTTP
:- http_handler('/', welcomePage, []).
:- http_handler('/login', loginPage, []).
:- http_handler('/register', registerPage, []).
:- http_handler('/profile', profilePage, []).
:- http_handler('/surah', surahPage, []).
:- http_handler('/detail-surah', detailSurahPage, []).
:- http_handler('/favorite-ayahs', favAyahPage, []).
:- http_handler('/static/', serve_static, [prefix]).

% Predikat untuk melayani file index.html
welcomePage(Request) :-
    http_reply_file('index.html', [], Request).

% Predikat untuk melayani file login.html
loginPage(Request) :-
    http_reply_file('login.html', [], Request).

% Predikat untuk melayani file register.html
registerPage(Request) :-
    http_reply_file('register.html', [], Request).

% Predikat untuk melayani file profile.html
profilePage(Request) :-
    http_reply_file('profile.html', [], Request).

% Predikat untuk melayani file surah.html
surahPage(Request) :-
    http_reply_file('surah.html', [], Request).

detailSurahPage(Request) :-
    http_reply_file('detail-surah.html', [], Request).

favAyahPage(Request) :-
    http_reply_file('favorite-ayah.html', [], Request).

% Predikat untuk melayani file statis
serve_static(Request) :-
    http_reply_from_files('.', [], Request).

% Memulai server pada port 1111 saat inisialisasi
:- initialization(start_server).