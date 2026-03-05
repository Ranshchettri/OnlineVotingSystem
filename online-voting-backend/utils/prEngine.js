const round2 = (value) => Number(Number(value || 0).toFixed(2));

const normalizeMethod = (method = "") => {
  const m = String(method || "").trim().toUpperCase();
  if (["SIMPLE", "PR", "ROUND"].includes(m)) return "SIMPLE";
  if (["DHONDT", "D_HONDT", "D-HONDT"].includes(m)) return "DHONDT";
  if (["SAINTE_LAGUE", "SAINTE-LAGUE", "SAINTELAGUE"].includes(m))
    return "SAINTE_LAGUE";
  return "DHONDT";
};

const sortByVotes = (rows) =>
  [...rows].sort((a, b) => {
    if (b.votes === a.votes) {
      return String(a.partyName || "").localeCompare(String(b.partyName || ""));
    }
    return Number(b.votes || 0) - Number(a.votes || 0);
  });

const addPercentages = (rows, totalVotes) =>
  rows.map((row) => ({
    ...row,
    votePercentage:
      totalVotes > 0 ? round2((Number(row.votes || 0) / totalVotes) * 100) : 0,
  }));

const applyThreshold = (rows, thresholdPercent) => {
  const threshold = Math.max(0, Number(thresholdPercent || 0));
  return rows.map((row) => ({
    ...row,
    eligible: row.votePercentage >= threshold,
    seats: 0,
  }));
};

const allocateSimple = (rows, totalSeats) => {
  const eligible = rows.filter((r) => r.eligible);
  const eligibleVotes = eligible.reduce(
    (sum, row) => sum + Number(row.votes || 0),
    0,
  );

  if (!eligible.length || eligibleVotes <= 0 || totalSeats <= 0) {
    return rows.map((row) => ({ ...row, seats: 0 }));
  }

  const withRemainder = rows.map((row) => {
    if (!row.eligible) return { ...row, seats: 0, _remainder: 0 };
    const exact = (Number(row.votes || 0) / eligibleVotes) * totalSeats;
    const whole = Math.floor(exact);
    return { ...row, seats: whole, _remainder: exact - whole };
  });

  const allocated = withRemainder.reduce(
    (sum, row) => sum + Number(row.seats || 0),
    0,
  );
  let remaining = Math.max(0, totalSeats - allocated);

  if (remaining > 0) {
    const order = [...withRemainder]
      .map((row, index) => ({
        index,
        remainder: row._remainder || 0,
        votes: Number(row.votes || 0),
      }))
      .sort((a, b) => {
        if (b.remainder === a.remainder) return b.votes - a.votes;
        return b.remainder - a.remainder;
      });

    for (let i = 0; i < order.length && remaining > 0; i += 1) {
      const idx = order[i].index;
      if (!withRemainder[idx].eligible) continue;
      withRemainder[idx].seats += 1;
      remaining -= 1;
    }
  }

  return withRemainder.map(({ _remainder, ...row }) => row);
};

const divisorSequence = (method, count) => {
  if (method === "SAINTE_LAGUE") {
    return Array.from({ length: count }, (_, i) => 2 * i + 1);
  }
  return Array.from({ length: count }, (_, i) => i + 1);
};

const allocateDivisorMethod = (rows, totalSeats, method) => {
  const eligible = rows.filter((r) => r.eligible);
  const eligibleVotes = eligible.reduce(
    (sum, row) => sum + Number(row.votes || 0),
    0,
  );

  if (!eligible.length || eligibleVotes <= 0 || totalSeats <= 0) {
    return rows.map((row) => ({ ...row, seats: 0 }));
  }

  const divisors = divisorSequence(method, totalSeats + 5);
  const quotients = [];

  for (const row of eligible) {
    const votes = Number(row.votes || 0);
    for (const d of divisors) {
      quotients.push({
        partyId: String(row.partyId),
        quotient: votes / d,
        votes,
      });
    }
  }

  quotients.sort((a, b) => {
    if (b.quotient === a.quotient) return b.votes - a.votes;
    return b.quotient - a.quotient;
  });

  const top = quotients.slice(0, totalSeats);
  const seatMap = new Map();
  for (const item of top) {
    seatMap.set(item.partyId, Number(seatMap.get(item.partyId) || 0) + 1);
  }

  return rows.map((row) => ({
    ...row,
    seats: row.eligible ? Number(seatMap.get(String(row.partyId)) || 0) : 0,
  }));
};

const buildCoalitions = (standings, majorityMark) => {
  const positive = standings.filter((row) => Number(row.seats || 0) > 0);
  const maxSize = Math.min(4, positive.length);
  const results = [];

  const dfs = (start, combo, seats) => {
    if (combo.length >= 2 && seats >= majorityMark) {
      results.push({
        parties: combo.map((row) => String(row.partyId)),
        partyNames: combo.map((row) => row.partyName),
        totalSeats: seats,
        note: seats >= majorityMark + 5 ? "Stable majority" : "Simple majority",
      });
    }

    if (combo.length >= maxSize) return;

    for (let i = start; i < positive.length; i += 1) {
      const item = positive[i];
      dfs(i + 1, [...combo, item], seats + Number(item.seats || 0));
    }
  };

  dfs(0, [], 0);

  return results
    .sort((a, b) => {
      if (a.parties.length !== b.parties.length) {
        return a.parties.length - b.parties.length;
      }
      return b.totalSeats - a.totalSeats;
    })
    .slice(0, 10);
};

const calculatePRResult = ({
  partyRows = [],
  totalSeats = 100,
  method = "DHONDT",
  thresholdPercent = 0,
}) => {
  const seats = Math.max(0, Number(totalSeats || 0));
  const totalVotes = partyRows.reduce(
    (sum, row) => sum + Number(row.votes || 0),
    0,
  );
  const majorityMark = seats > 0 ? Math.floor(seats / 2) + 1 : 0;
  const selectedMethod = normalizeMethod(method);

  let rows = sortByVotes(
    partyRows.map((row) => ({
      partyId: String(row.partyId),
      partyName: row.partyName || "Party",
      shortName: row.shortName || "",
      votes: Number(row.votes || 0),
      seats: 0,
    })),
  );

  rows = addPercentages(rows, totalVotes);
  rows = applyThreshold(rows, thresholdPercent);

  if (selectedMethod === "SIMPLE") {
    rows = allocateSimple(rows, seats);
  } else {
    rows = allocateDivisorMethod(rows, seats, selectedMethod);
  }

  rows = rows.map((row) => ({
    partyId: row.partyId,
    partyName: row.partyName,
    shortName: row.shortName,
    votes: row.votes,
    votePercentage: row.votePercentage,
    seats: Number(row.seats || 0),
    eligible: Boolean(row.eligible),
  }));

  rows.sort((a, b) => {
    if (b.seats === a.seats) {
      if (b.votes === a.votes) return a.partyName.localeCompare(b.partyName);
      return b.votes - a.votes;
    }
    return b.seats - a.seats;
  });

  const top = rows[0] || null;
  const singlePartyMajority = top && Number(top.seats || 0) >= majorityMark;
  const coalitionSuggestions = singlePartyMajority
    ? []
    : buildCoalitions(rows, majorityMark);

  return {
    totalVotes,
    totalSeats: seats,
    majorityMark,
    method: selectedMethod,
    thresholdPercent: Number(thresholdPercent || 0),
    standings: rows,
    majority: singlePartyMajority
      ? {
          type: "Single Party Government",
          partyId: top.partyId,
          partyName: top.partyName,
          seats: top.seats,
        }
      : {
          type: "Coalition Required",
          partyId: null,
          partyName: null,
          seats: top ? top.seats : 0,
        },
    coalitionRequired: !singlePartyMajority,
    coalitionSuggestions,
  };
};

module.exports = {
  calculatePRResult,
  normalizeMethod,
};
