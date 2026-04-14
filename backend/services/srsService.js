/**
 * SM-2 Algorithm Implementation for Spacing Revisions
 * Based on the SuperMemo-2 algorithm.
 */

/**
 * Calculates the next review state for a card based on user performance.
 * 
 * @param {Object} currentState - Current { interval, easeFactor, repetitions }
 * @param {number} rating - User quality rating (0-5)
 * @returns {Object} Updated { interval, easeFactor, repetitions, nextReviewDate, status }
 */
export const calculateSM2 = (currentState, rating) => {
  let { interval, easeFactor, repetitions } = currentState;
  let status = 'Reviewing';

  // SM-2 logic requires performance >= 3 for success
  if (rating < 3) {
    // Incorrect response
    repetitions = 0;
    interval = 1;
    status = 'Learning';
  } else {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
    repetitions++;

    // Check if mastered (Lowered threshold from 30 to 14 for better responsiveness)
    if (interval >= 14) {
      status = 'Mastered';
    }
  }

  // Update Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  
  // Floor Ease Factor at 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
    status
  };
};
