export function buildPddlProblem(beliefs, desire) {
    switch (desire) {
        case "go-to-parcel": {
            break;
        }
        case "go-to-deliver": {
            break;
        }
        case "explore": {
            break;
        }
        default:
            console.warn("Unknown intention:", desire);
    }
}
