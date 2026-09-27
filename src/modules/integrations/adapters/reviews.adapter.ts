import { ReviewItem } from '../types.js';

export class ReviewReputationAdapter {
  /**
   * Generates a personalized, professional response to a review in the brand tone
   */
  static generateAutoResponse(brandName: string, review: ReviewItem): string {
    if (review.rating >= 4) {
      return `Thank you so much, ${review.authorName}! 🌟 Our entire clinical team at ${brandName} is thrilled to hear about your great experience. We look forward to seeing your confident smile at your next visit!`;
    }

    if (review.rating === 3) {
      return `Dear ${review.authorName}, thank you for sharing your feedback. We are committed to continuous clinical improvement. Please feel free to reach out to our clinic director directly so we can ensure your next visit is exceptional.`;
    }

    // 1-Star or 2-Star: Crisis Shield response
    return `Dear ${review.authorName}, we sincerely apologize that your experience did not meet our high standards at ${brandName}. Patient comfort and care are our utmost priorities. Please contact our practice manager directly at patientcare@${brandName.toLowerCase().replace(/\s+/g, '')}.com so we can resolve this matter for you immediately.`;
  }
}
