"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearComparison,
  loadMarketComparison,
  selectComparisonError,
  selectComparisonParams,
  selectComparisonResults,
  selectComparisonStatus,
} from "../../app/features/marketSnapshotSlice";

/**
 * Load one or more market snapshots (same income/bedrooms) via Redux + AppSync.
 *
 * @returns {{ results, status, error, params, fetchComparison, clear }}
 */
export function useMarketSnapshot() {
  const dispatch = useDispatch();
  const results = useSelector(selectComparisonResults);
  const status = useSelector(selectComparisonStatus);
  const error = useSelector(selectComparisonError);
  const params = useSelector(selectComparisonParams);

  const fetchComparison = useCallback(
    (args) => dispatch(loadMarketComparison(args)),
    [dispatch]
  );

  const clear = useCallback(() => dispatch(clearComparison()), [dispatch]);

  return { results, status, error, params, fetchComparison, clear };
}
