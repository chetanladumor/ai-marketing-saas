import { AnalyticsEvent, AttributionJourney, ChannelPerformance, MarketingChannel } from './types.js';

export class AttributionEngine {
  /**
   * Computes channel performance metrics (CTR, CVR, CPA, ROAS)
   */
  static computeChannelMetrics(
    events: AnalyticsEvent[],
    spendMap: Partial<Record<MarketingChannel, number>>
  ): ChannelPerformance[] {
    const channelMap = new Map<MarketingChannel, { clicks: number; conversions: number; revenue: number }>();

    for (const e of events) {
      const stats = channelMap.get(e.channel) || { clicks: 0, conversions: 0, revenue: 0 };
      if (e.eventType === 'AD_CLICK' || e.eventType === 'PAGEVIEW') {
        stats.clicks++;
      }
      if (e.eventType === 'APPOINTMENT_BOOKED' || e.eventType === 'FORM_SUBMIT') {
        stats.conversions++;
        stats.revenue += e.revenueUsd || 0;
      }
      channelMap.set(e.channel, stats);
    }

    const results: ChannelPerformance[] = [];
    const channels: MarketingChannel[] = ['META_ADS', 'GOOGLE_SEARCH', 'SEO_ORGANIC', 'WHATSAPP', 'EMAIL_NURTURE'];

    for (const ch of channels) {
      const stats = channelMap.get(ch) || { clicks: 0, conversions: 0, revenue: 0 };
      const spend = spendMap[ch] || 0;
      const impressions = stats.clicks * (ch === 'META_ADS' ? 28 : ch === 'GOOGLE_SEARCH' ? 18 : 12);
      const ctr = impressions > 0 ? (stats.clicks / impressions) * 100 : 0;
      const cvr = stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0;
      const cpa = stats.conversions > 0 ? spend / stats.conversions : spend;
      const roas = spend > 0 ? stats.revenue / spend : stats.revenue > 0 ? 99.0 : 0;

      results.push({
        channel: ch,
        impressions,
        clicks: stats.clicks,
        conversions: stats.conversions,
        adSpendUsd: spend,
        revenueUsd: stats.revenue,
        ctrPercent: Number(ctr.toFixed(2)),
        conversionRatePercent: Number(cvr.toFixed(2)),
        cpaUsd: Number(cpa.toFixed(2)),
        roasRatio: Number(roas.toFixed(2)),
      });
    }

    return results;
  }

  /**
   * Reconstructs multi-touch customer journeys to model attribution
   */
  static reconstructJourneys(events: AnalyticsEvent[]): AttributionJourney[] {
    const userEventsMap = new Map<string, AnalyticsEvent[]>();

    for (const e of events) {
      const userList = userEventsMap.get(e.userIdOrSession) || [];
      userList.push(e);
      userEventsMap.set(e.userIdOrSession, userList);
    }

    const journeys: AttributionJourney[] = [];

    for (const [userId, userEvents] of userEventsMap.entries()) {
      userEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const conversionEvent = userEvents.find(
        (e) => e.eventType === 'APPOINTMENT_BOOKED' || e.eventType === 'FORM_SUBMIT'
      );

      if (conversionEvent) {
        const touchpoints = userEvents
          .filter((e) => e.eventType === 'AD_CLICK' || e.eventType === 'PAGEVIEW')
          .map((e) => ({
            channel: e.channel,
            timestamp: e.timestamp,
            campaignName: e.utmCampaign,
          }));

        if (touchpoints.length > 0) {
          journeys.push({
            leadId: userId,
            leadName: `Patient_${userId.slice(0, 6)}`,
            totalTouches: touchpoints.length,
            touchpoints,
            convertedRevenueUsd: conversionEvent.revenueUsd || 2200,
            firstTouchChannel: touchpoints[0].channel,
            lastTouchChannel: touchpoints[touchpoints.length - 1].channel,
          });
        }
      }
    }

    return journeys;
  }
}
