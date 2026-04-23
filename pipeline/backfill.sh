#!/bin/bash
# Backfill pipeline for all months from July 2024 through March 2026
# Usage: bash backfill.sh [start_from]
# Example: bash backfill.sh "2024-08" to skip July 2024

cd "$(dirname "$0")"

MONTHS=(
  "2024 7"
  "2024 8"
  "2024 9"
  "2024 10"
  "2024 11"
  "2024 12"
  "2025 1"
  "2025 2"
  "2025 3"
  "2025 4"
  "2025 5"
  "2025 6"
  "2025 7"
  "2025 8"
  "2025 9"
  "2025 10"
  "2025 11"
  "2025 12"
  "2026 1"
  "2026 2"
  "2026 3"
)

TOTAL=${#MONTHS[@]}
SUCCESS=0
FAILED=0

for i in "${!MONTHS[@]}"; do
  YM=(${MONTHS[$i]})
  YEAR=${YM[0]}
  MONTH=${YM[1]}
  IDX=$((i + 1))
  echo ""
  echo "=========================================="
  echo "[$IDX/$TOTAL] Processing $YEAR-$(printf '%02d' $MONTH)"
  echo "=========================================="

  python -m src.run_pipeline "$YEAR" "$MONTH" 2>&1

  if [ $? -eq 0 ]; then
    SUCCESS=$((SUCCESS + 1))
    echo "[OK] $YEAR-$(printf '%02d' $MONTH) complete"
  else
    FAILED=$((FAILED + 1))
    echo "[FAIL] $YEAR-$(printf '%02d' $MONTH) had errors"
  fi
done

echo ""
echo "=========================================="
echo "BACKFILL COMPLETE"
echo "  Success: $SUCCESS / $TOTAL"
echo "  Failed:  $FAILED / $TOTAL"
echo "=========================================="
