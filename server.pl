:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_files)).

% Memulai server
start_server :-
    http_server(http_dispatch, [port(1111)]).

% Server HTTP

% Home page
:- http_handler('/', welcomePage, []).

% Authentication
:- http_handler('/login', loginPage, []).
:- http_handler('/register', registerPage, []).

% User profile
:- http_handler('/profile', profilePage, []).

% Surah
:- http_handler('/surah', surahPage, []).
:- http_handler('/detail-surah', detailSurahPage, []).

% Fav. Ayahs
:- http_handler('/favorite-ayahs', favAyahPage, []).


% Static file handler
% :- http_handler('/static/', serve_static, [prefix]).
:- http_handler('/css/', serve_css, [prefix]).
:- http_handler('/js/', serve_js, [prefix]).

% Predikat untuk melayani file index.html
welcomePage(Request) :-
    http_reply_file('views/index.html', [], Request).

% Predikat untuk melayani file login.html
loginPage(Request) :-
    http_reply_file('views/login.html', [], Request).

% Predikat untuk melayani file register.html
registerPage(Request) :-
    http_reply_file('views/register.html', [], Request).

% Predikat untuk melayani file profile.html
profilePage(Request) :-
    http_reply_file('views/profile.html', [], Request).

% Predikat untuk melayani file surah.html
surahPage(Request) :-
    http_reply_file('views/surah.html', [], Request).

detailSurahPage(Request) :-
    http_reply_file('views/detail-surah.html', [], Request).

favAyahPage(Request) :-
    http_reply_file('views/favorite-ayah.html', [], Request).

% Predikat untuk melayani file statis
serve_css(Request) :-
    http_reply_from_files('public/css', [], Request).

serve_js(Request) :-
    http_reply_from_files('public/js', [], Request).

% Memulai server pada port 1111 saat inisialisasi
:- initialization(start_server).