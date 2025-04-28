;; domain file: domain-deliveroo-0.pddl
(define (domain default)
    (:requirements :strips)
    (:predicates
        (me ?me)
        (at ?me ?from)
        (up ?from ?to)
        (at ?me ?to)
        (down ?from ?to)
        (left ?from ?to)
        (right ?from ?to)              
    )
    (:action moveUp
    :parameters (?me ?from ?to)
    :precondition (and (me ?me) (at ?me ?from) (up ?from ?to))
    :effect (and (at ?me ?to) (not (at ?me ?from)))
)
        (:action moveDown
    :parameters (?me ?from ?to)
    :precondition (and (me ?me) (at ?me ?from) (down ?from ?to))
    :effect (and (at ?me ?to) (not (at ?me ?from)))
)
        (:action moveLeft
    :parameters (?me ?from ?to)
    :precondition (and (me ?me) (at ?me ?from) (left ?from ?to))
    :effect (and (at ?me ?to) (not (at ?me ?from)))
)
        (:action moveRight
    :parameters (?me ?from ?to)
    :precondition (and (me ?me) (at ?me ?from) (right ?from ?to))
    :effect (and (at ?me ?to) (not (at ?me ?from)))
)
)