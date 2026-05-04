export const generateSamePattern = (shiftId, length) => {
  return Array(length).fill(shiftId);
};

export const generateSortPattern = (startShiftId, availableShifts, length) => {
  const typeOrder = ['MORNING', 'AFTERNOON', 'EVENING'];

  const startShift = availableShifts.find(s => String(s.id) === String(startShiftId));
  if (!startShift) return Array(length).fill(null);

  const startType = startShift.type?.toUpperCase();
  let startIndex = typeOrder.indexOf(startType);
  if (startIndex === -1) startIndex = 0;

  const pattern = [];
  for (let i = 0; i < length; i++) {
    const currentType = typeOrder[(startIndex + i) % typeOrder.length];
    const shift = availableShifts.find(s => s.type?.toUpperCase() === currentType);
    pattern.push(shift ? shift.id : null);
  }

  return pattern;
};

export const generateRotationPattern = (basePattern, length) => {
  if (!basePattern || basePattern.length === 0) return Array(length).fill(null);

  const pattern = [];
  for (let i = 0; i < length; i++) {
    pattern.push(basePattern[i % basePattern.length]);
  }

  return pattern;
};

export const getRotationVariations = (startShiftId, availableShifts) => {
  const startShift = availableShifts.find(s => String(s.id) === String(startShiftId));
  if (!startShift) return [];

  const startType = startShift.type?.toUpperCase();
  const types = ['MORNING', 'AFTERNOON', 'EVENING'].filter(t => t !== startType);

  const variations = [
    [startType, types[0], types[1]],
    [startType, types[1], types[0]]
  ];

  return variations.map(v => {
    return v.map(type => {
      const shift = availableShifts.find(s => s.type?.toUpperCase() === type);
      return shift ? shift.id : null;
    }).filter(id => id !== null);
  });
};
