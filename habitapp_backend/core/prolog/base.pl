% Hechos: Categorias y Habitos sugeridos
% categoria_habito(Categoria, Habito, Dificultad, Puntos).
categoria_habito('Salud', 'Beber 2 litros de agua', 'Facil', 10).
categoria_habito('Salud', 'Correr 30 minutos', 'Medio', 30).
categoria_habito('Salud', 'Dormir 8 horas', 'Facil', 15).
categoria_habito('Estudio', 'Leer 1 capitulo', 'Medio', 20).
categoria_habito('Estudio', 'Practicar programacion', 'Dificil', 50).
categoria_habito('Estudio', 'Repasar notas', 'Facil', 10).
categoria_habito('Mindfulness', 'Meditar 10 minutos', 'Facil', 15).
categoria_habito('Mindfulness', 'Escribir diario', 'Medio', 25).

% Reglas

% Sugerir habitos por categoria
sugerir_habito(Categoria, Habito) :-
    categoria_habito(Categoria, Habito, _, _).

% Sugerir habitos por dificultad
sugerir_por_dificultad(Dificultad, Habito) :-
    categoria_habito(_, Habito, Dificultad, _).

% Verificar si un usuario es consistente basado en su racha
% es_consistente(Racha).
es_consistente(Racha) :-
    Racha >= 7.

% Calcular bonus de puntos basado en la racha
% calcular_bonus(Racha, Bonus).
calcular_bonus(Racha, Bonus) :-
    Racha >= 30,
    Bonus is 100.
calcular_bonus(Racha, Bonus) :-
    Racha >= 7,
    Racha < 30,
    Bonus is 50.
calcular_bonus(Racha, Bonus) :-
    Racha < 7,
    Bonus is 0.

% Determinar nivel de usuario basado en puntos totales
% nivel_usuario(Puntos, Nivel).
nivel_usuario(Puntos, 'Principiante') :-
    Puntos < 100.
nivel_usuario(Puntos, 'Intermedio') :-
    Puntos >= 100,
    Puntos < 500.
nivel_usuario(Puntos, 'Avanzado') :-
    Puntos >= 500,
    Puntos < 1000.
nivel_usuario(Puntos, 'Maestro') :-
    Puntos >= 1000.
