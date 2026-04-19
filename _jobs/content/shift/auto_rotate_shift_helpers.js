// pattern: 2 pagi, 2 sore, 2 malam, 1 off
const ROTATION = [1, 1, 2, 2, 3, 3, 0]

export function getNextShiftIndex(currentIndex) {
    return (currentIndex + 1) % ROTATION.length
}

export function getShiftByIndex(index) {
    return ROTATION[index]
}

// cari index terakhir dari history user
export function getLastRotationIndex(assignments) {
    if (!assignments.length) return 0

    const last = assignments[assignments.length - 1]

    const shiftId = last.shiftId ?? 0

    const index = ROTATION.findIndex((s) => s === shiftId)

    return index === -1 ? 0 : index
}
