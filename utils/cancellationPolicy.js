import { getPageBySlug } from '@/utils/api';

export const FALLBACK_CANCELLATION_HTML = `
<p>At <strong>Tour &amp; Holiday</strong>, we understand that travel plans can change unexpectedly. Our Cancellation Policy explains the terms and conditions applicable when a customer cancels a booking, requests a date change, or seeks a refund for any tour package booked through our website.</p>
<p>This policy applies to all tour packages offered by Tour &amp; Holiday, including domestic tours, international holidays, honeymoon packages, family tours, group trips, and customized travel packages, unless specific terms are communicated in writing at the time of booking.</p>
<h3><strong>1. Cancellation by the Customer</strong></h3>
<p>If you wish to cancel your booking, you must submit your cancellation request to Tour &amp; Holiday through our official communication channels. Cancellation requests will be considered effective once they have been received and acknowledged by our team.</p>
<p>The applicable cancellation charges will depend on the time remaining before the scheduled departure date, the amount already paid, and the cancellation terms of the hotels, airlines, transport providers, activity operators, or other suppliers included in your package.</p>
<p>Unless different terms have been expressly communicated and accepted at the time of booking, the following standard cancellation schedule may apply:</p>
<p><strong>30 days or more before departureUp to 10%</strong></p>
<p>of total package cost charged</p>
<p><strong>15–29 days before departureUp to 25%</strong></p>
<p>of total package cost charged</p>
<p><strong>7–14 days before departureUp to 50%</strong></p>
<p>of total package cost charged</p>
<p><strong>Less than 7 days before departureUp to 75%</strong></p>
<p>of total package cost charged</p>
<p><strong>On departure date, after departure, or no-showUp to 100%</strong></p>
<p>No refund applicable</p>
<p>These are proposed standard terms. Actual cancellation charges may differ where supplier conditions, non-refundable bookings, special offers, peak-season arrangements, visa services, or other package-specific terms apply. Any applicable variation should be disclosed to the customer before booking confirmation.</p>
<h3><strong>2. Refund Policy</strong></h3>
<p>Once a cancellation request has been reviewed and the applicable charges have been calculated, any eligible refund will be processed using the original payment method wherever possible.</p>
<p>⏱</p>
<p><strong>Processing Timeline:</strong> Refunds are generally initiated within <strong>7–14 business days</strong> after cancellation approval. The time taken for the refunded amount to appear in your account may vary depending on your bank, card issuer, payment gateway, or other payment service provider.</p>
<p>Any non-refundable booking fees, payment processing charges where applicable, supplier penalties, or other charges disclosed in the booking terms may be deducted from the refundable amount.</p>
<h3><strong>3. Non-Refundable Bookings</strong></h3>
<p>Certain travel services may be non-refundable, including but not limited to:</p>
<ul>
  <li>Promotional or special-discount packages sold under non-refundable conditions.</li>
  <li>Flight tickets, train tickets, hotel reservations, permits, or activities subject to non-refundable supplier rules.</li>
  <li>Bookings made during peak seasons or special events with specific cancellation conditions.</li>
  <li>Services already used, delivered, or confirmed under non-refundable terms.</li>
</ul>
<p>Any non-refundable conditions applicable to your booking should be communicated before payment or booking confirmation.</p>
<h3><strong>4. Cancellation by Tour &amp; Holiday</strong></h3>
<p>Tour &amp; Holiday reserves the right to cancel or modify a tour due to insufficient participation, operational difficulties, safety concerns, natural disasters, government restrictions, or other circumstances beyond its reasonable control.</p>
<p>If Tour &amp; Holiday cancels a package and cannot offer a suitable alternative, eligible refunds for amounts paid for the affected services will be handled in accordance with the booking terms and applicable law. Any deductions or exclusions must be supported by the relevant booking conditions and applicable supplier terms.</p>
<p>Where possible, we may offer an alternative departure date, a replacement package, or a credit toward a future booking. Any alternative arrangement will be subject to mutual agreement.</p>
<h3><strong>5. Changes to Booking Dates or Travel Plans</strong></h3>
<p>Customers who wish to change their travel dates, destination, accommodation, passenger details, or other package arrangements should contact Tour &amp; Holiday as early as possible.</p>
<p>Changes are subject to availability and approval by the relevant travel suppliers. Additional costs, fare differences, amendment fees, or supplier penalties may apply. If a requested change cannot be accommodated, the original cancellation terms may apply.</p>
<h3><strong>6. Force Majeure and Unforeseen Circumstances</strong></h3>
<p>Tour &amp; Holiday is not responsible for disruptions caused by circumstances beyond its reasonable control, including extreme weather, natural disasters, epidemics, pandemics, political unrest, strikes, government restrictions, or transportation disruptions.</p>
<p>In such cases, we will make reasonable efforts to assist customers with available alternatives, rescheduling, or refund requests, subject to the terms of the booking, the policies of the relevant service providers, and applicable law.</p>
<h3><strong>7. Travel Insurance</strong></h3>
<p>🛡️</p>
<p><strong>Strong Recommendation:</strong> We strongly recommend that customers purchase suitable travel insurance covering trip cancellation, medical emergencies, travel delays, baggage loss, and other unforeseen events.</p>
<p>Travel insurance may help protect you against certain losses that are not refundable under the applicable booking conditions. Coverage depends on your insurer and policy terms.</p>
<h3><strong>8. How to Request a Cancellation</strong></h3>
<p>To cancel a booking, please contact our support team using the contact details provided in your booking confirmation or on our official website.</p>
<p>Please include your <strong>booking reference number</strong>, the <strong>lead traveller's name</strong>, your <strong>scheduled departure date</strong>, and the <strong>reason for cancellation</strong>. Our team will review your request and communicate the applicable cancellation charges and refund eligibility.</p>
<h3><strong>9. Policy Updates</strong></h3>
<p>Tour &amp; Holiday may update this Cancellation Policy from time to time. Any changes will be published on this page with an updated revision date. The terms applicable to an existing booking will be determined by the conditions communicated and accepted at the time of booking, subject to applicable law.</p>
<h3><strong>10. Contact Us</strong></h3>
<p>For cancellation requests, refund-related queries, or assistance with your booking, please contact Tour &amp; Holiday through the official contact details listed on our website or in your booking confirmation.</p>
<p><strong>✓ By confirming a booking, customers acknowledge that they have had the opportunity to review the applicable cancellation and refund terms.</strong></p>
`;

export const FALLBACK_CANCELLATION_DATA = {
  title: 'Cancellation Policy',
  subtitle: 'Transparent terms & standard refund schedule',
  updatedPill: 'Updated Oct 2026',
  previewText:
    'At Tour & Holiday, we understand that travel plans can change unexpectedly. Our Cancellation Policy explains the terms and conditions applicable when a customer cancels a booking, requests a date change, or seeks a refund for any tour package booked through our website. This policy applies to all tour packages offered by Tour & Holiday, including domestic tours, international holidays, honeymoon packages, family tours, group trips, and customized travel packages, unless specific terms are communicated in writing at the time of booking.',
  rawHtml: FALLBACK_CANCELLATION_HTML,
};

/**
 * Normalizes CMS page data from /pages/slug/cancellation-policy into a clean structured object
 */
export function normalizeCancellationData(pageData) {
  if (!pageData) return FALLBACK_CANCELLATION_DATA;

  const detail = Array.isArray(pageData.details)
    ? pageData.details.find(
        (d) => d.key === 'cancillation_key' || d.section === 'story_grid' || d.json_data?.story_desc
      ) || pageData.details[0]
    : null;

  let jsonData = detail?.json_data;
  if (typeof jsonData === 'string') {
    try {
      jsonData = JSON.parse(jsonData);
    } catch {
      jsonData = {};
    }
  }

  const title = pageData.title || detail?.title || 'Cancellation Policy';
  const subtitle =
    jsonData?.heading_content?.trim() ||
    pageData.description ||
    'Transparent terms & standard refund schedule';

  const statsVal = Array.isArray(jsonData?.stats) ? jsonData.stats[0]?.value : null;
  const updatedPill = statsVal?.trim() || 'Updated Oct 2026';
  const rawHtml = jsonData?.story_desc || FALLBACK_CANCELLATION_HTML;

  // Extract clean plain text for 3-line clamp preview
  let previewText = '';
  if (rawHtml) {
    const pMatches = rawHtml.match(/<p>([\s\S]*?)<\/p>/gi) || [];
    const textPieces = [];
    for (const p of pMatches) {
      const clean = p
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      if (
        clean &&
        !clean.includes('Up to') &&
        clean !== '⏱' &&
        clean !== '🛡️' &&
        !clean.startsWith('1.') &&
        !clean.startsWith('✓')
      ) {
        textPieces.push(clean);
      }
      if (textPieces.length >= 2) break;
    }
    previewText = textPieces.join(' ');
  }

  if (!previewText) {
    previewText = FALLBACK_CANCELLATION_DATA.previewText;
  }

  return {
    title,
    subtitle,
    updatedPill,
    rawHtml,
    previewText,
    updatedAt: pageData.updated_at || pageData.created_at,
  };
}

/**
 * Transforms CMS HTML content into rich formatted components identical to our premium design
 */
export function transformCancellationHtml(rawHtml) {
  if (!rawHtml) return '';
  let html = rawHtml.trim();

  // 1. Group consecutive schedule items into a modern table structure matching the reference image
  const schedItems = [];
  let schedMatch;
  const globalRegex = /<p>\s*<strong>([^<]+?)(?:Up to\s+(\d+%))<\/strong>\s*<\/p>\s*<p>\s*([^<]+?)\s*<\/p>/gi;
  while ((schedMatch = globalRegex.exec(html)) !== null) {
    const time = schedMatch[1].trim();
    const charge = 'Up to ' + schedMatch[2];
    const note = schedMatch[3].trim();
    const pct = parseInt(schedMatch[2], 10);
    let chargeClass = 'cpm-sched-charge--low';
    if (pct > 75) chargeClass = 'cpm-sched-charge--critical';
    else if (pct > 40) chargeClass = 'cpm-sched-charge--high';
    else if (pct > 15) chargeClass = 'cpm-sched-charge--med';

    const isFull = pct === 100 || /departure|no-show/i.test(time);
    schedItems.push({
      matchStr: schedMatch[0],
      html: `
        <div class="cpm-table-row ${isFull ? 'cpm-table-row--full' : ''}">
          <div class="cpm-table-pill">
            <svg class="cpm-cal-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${time}</span>
          </div>
          <div class="cpm-table-charge">
            <strong class="cpm-charge-rate ${chargeClass}">${charge}</strong>
            <span class="cpm-charge-note">${note}</span>
          </div>
        </div>
      `,
    });
  }

  if (schedItems.length > 0) {
    const tableHtml = `
      <div class="cpm-schedule-box">
        <div class="cpm-table-head">
          <span class="cpm-th-time">Time Before Departure</span>
          <span class="cpm-th-charge">Cancellation Charges</span>
        </div>
        <div class="cpm-table-body">
          ${schedItems.map((i) => i.html).join('')}
        </div>
      </div>
    `;
    const firstMatch = schedItems[0].matchStr;
    const startIdx = html.indexOf(firstMatch);
    if (startIdx !== -1) {
      const lastMatch = schedItems[schedItems.length - 1].matchStr;
      const endIdx = html.indexOf(lastMatch) + lastMatch.length;
      html = html.substring(0, startIdx) + tableHtml + html.substring(endIdx);
    }
  }

  // 2. Timeline highlight box (remove preceding standalone emoji if present, wrap content)
  html = html.replace(/<p>\s*(?:⏱|&#9201;)?\s*<\/p>\s*/gi, '');
  html = html.replace(
    /<p>\s*(<strong>Processing Timeline:?<\/strong>[\s\S]*?)<\/p>/gi,
    '<div class="cpm-highlight-box"><div class="cpm-highlight-icon">⏱</div><div>$1</div></div>'
  );

  // 3. Travel insurance highlight box (remove preceding standalone emoji if present, wrap content)
  html = html.replace(/<p>\s*(?:🛡️?|&#128737;)?\s*<\/p>\s*/gi, '');
  html = html.replace(
    /<p>\s*(<strong>Strong Recommendation:?<\/strong>[\s\S]*?)<\/p>/gi,
    '<div class="cpm-highlight-box cpm-highlight-box--amber"><div class="cpm-highlight-icon">🛡️</div><div>$1</div></div>'
  );

  // 4. Disclaimer text under schedule (with circular info icon)
  html = html.replace(
    /<p>\s*(These are proposed standard terms[\s\S]*?)<\/p>/gi,
    `<div class="cpm-disclaimer-callout">
      <div class="cpm-disclaimer-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <p class="cpm-disclaimer-text">$1</p>
    </div>`
  );

  // 5. Acknowledgment checkmark box
  html = html.replace(
    /<p>\s*<strong>\s*(?:[✓✔]|\u2713|\u2714)?\s*(By confirming[\s\S]*?)<\/strong>\s*<\/p>/gi,
    '<p class="cpm-acknowledgment-box">✓ $1</p>'
  );

  // 6. Section 1 title icon (document/edit pen icon)
  html = html.replace(
    /<h3><strong>([0-9]+\.\s*[^<]+)<\/strong><\/h3>/gi,
    `<h3 class="cpm-section-heading">
      <span class="cpm-section-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </span>
      <span>$1</span>
    </h3>`
  );

  // 7. Structure intro callout and sections
  const firstH3Index = html.indexOf('<h3');
  if (firstH3Index > 0) {
    const introPart = html.substring(0, firstH3Index).trim();
    const restPart = html.substring(firstH3Index);

    // Split sections by <h3
    const sectionChunks = restPart.split(/(?=<h3)/i);
    const formattedSections = sectionChunks
      .map((chunk) => {
        return `<div class="cpm-section">${chunk}</div>`;
      })
      .join('');

    html = `<div class="cpm-intro-callout">${introPart}</div>${formattedSections}`;
  }

  return html;
}

let cachedPolicyData = null;

/**
 * Fetch cancellation policy from CMS API slug 'cancellation-policy'
 */
export async function getCancellationPolicy(customSlug) {
  if (cachedPolicyData && !customSlug) return cachedPolicyData;

  try {
    const slug = customSlug || 'cancellation-policy';
    let page = await getPageBySlug(slug);
    if (!page && slug !== 'cancellation-policy') {
      page = await getPageBySlug('cancellation-policy');
    }
    if (!page && slug !== 'cancellation') {
      page = await getPageBySlug('cancellation');
    }
    if (page && page.details) {
      const normalized = normalizeCancellationData(page);
      if (!customSlug) cachedPolicyData = normalized;
      return normalized;
    }
  } catch (err) {
    console.warn('Failed to load cancellation policy CMS page:', err);
  }

  return FALLBACK_CANCELLATION_DATA;
}
