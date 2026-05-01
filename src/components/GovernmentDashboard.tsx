import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PNG_PROVINCE_GEO } from "../data/pngProvinceGeo";

// ── Colour tokens ───────────────────────────────────────
const C = {
  bg:     "#f3f4f6",
  panel:  "#ffffff",
  border: "#e5e7eb",
  gold:   "#F5A623",
  green:  "#16a34a",
  amber:  "#d97706",
  red:    "#dc2626",
  slate:  "#94a3b8",
  text:   "#111827",
  muted:  "#4b5563",
  navy:   "#1a2e4a",
};

// ── Province data — all 22 PNG provinces ────────────────
// geoName = key into PNG_PROVINCE_GEO (only set when it differs from name)
const PROVINCES = [
  // Momase region
  { name: "Morobe",         geoName: "Morobe",       region: "Momase",    students: 3800, active: 1560, mastery: 68, status: "active" as const },
  { name: "Madang",         geoName: "Madang",       region: "Momase",    students: 2600, active: 1050, mastery: 70, status: "active" as const },
  { name: "East Sepik",     geoName: "E. Sepik",     region: "Momase",    students: 2400, active:  980, mastery: 67, status: "active" as const },
  { name: "West Sepik",     geoName: "Sandaun",      region: "Momase",    students: 1600, active:  420, mastery: 60, status: "warn"   as const },
  // Highlands region
  { name: "E. Highlands",   geoName: "E. Highlands", region: "Highlands", students: 3200, active: 1320, mastery: 66, status: "active" as const },
  { name: "W. Highlands",   geoName: "W. Highlands", region: "Highlands", students: 2900, active: 1180, mastery: 64, status: "active" as const },
  { name: "Chimbu",         geoName: "Chimbu",       region: "Highlands", students: 2100, active:  860, mastery: 65, status: "active" as const },
  { name: "Enga",           geoName: "Enga",         region: "Highlands", students: 2200, active:  890, mastery: 63, status: "active" as const },
  { name: "S. Highlands",   geoName: "S. Highlands", region: "Highlands", students: 2800, active: 1120, mastery: 61, status: "active" as const },
  { name: "Hela",           geoName: "Hela",         region: "Highlands", students: 1800, active:  540, mastery: 59, status: "warn"   as const },
  { name: "Jiwaka",         geoName: "Jiwaka",       region: "Highlands", students: 1600, active:  620, mastery: 64, status: "active" as const },
  // Papuan region
  { name: "NCD",            geoName: "NCD",          region: "Papuan",    students: 4200, active: 1840, mastery: 72, status: "active" as const },
  { name: "Central",        geoName: "Central",      region: "Papuan",    students: 2000, active:  780, mastery: 69, status: "active" as const },
  { name: "Gulf",           geoName: "Gulf",         region: "Papuan",    students: 1200, active:  320, mastery: 58, status: "warn"   as const },
  { name: "Milne Bay",      geoName: "Milne Bay",    region: "Papuan",    students: 1800, active:  620, mastery: 62, status: "warn"   as const },
  { name: "Oro",            geoName: "Oro",          region: "Papuan",    students: 1500, active:  180, mastery: 55, status: "off"    as const },
  { name: "Western",        geoName: "Western",      region: "Papuan",    students: 1900, active:  380, mastery: 56, status: "warn"   as const },
  // Islands region
  { name: "E. New Britain", geoName: "E. New Britain", region: "Islands", students: 1700, active:  680, mastery: 73, status: "active" as const },
  { name: "W. New Britain", geoName: "W. New Britain", region: "Islands", students: 1400, active:  540, mastery: 68, status: "active" as const },
  { name: "New Ireland",    geoName: "New Ireland",  region: "Islands",   students: 1100, active:  450, mastery: 71, status: "active" as const },
  { name: "Manus",          geoName: "Manus",        region: "Islands",   students:  800, active:  320, mastery: 69, status: "active" as const },
  { name: "Bougainville",   geoName: "Bougainville", region: "Islands",   students: 1300, active:  420, mastery: 65, status: "active" as const },
];

// Reverse lookup: geoName → province stats
function statsForGeo(geoName: string) {
  return PROVINCES.find(p => p.geoName === geoName) ?? null;
}

// Choropleth fill colour — vivid, readable on light background
function provinceColor(mastery: number, active: number, students: number, status: string): string {
  if (status === "off") return "rgba(148,163,184,0.45)";
  const rate = active / students;
  const alpha = 0.55 + rate * 0.30;   // 0.55 → 0.85
  if (mastery >= 70) return `rgba(22,163,74,${alpha.toFixed(2)})`;
  if (mastery >= 63) return `rgba(245,158,11,${alpha.toFixed(2)})`;
  if (mastery >= 55) return `rgba(251,146,60,${(alpha * 0.85).toFixed(2)})`;
  return `rgba(220,38,38,${alpha.toFixed(2)})`;
}

const REGION_COLORS: Record<string, string> = {
  Momase:    "#3b82f6",
  Highlands: "#F5A623",
  Papuan:    "#22c55e",
  Islands:   "#a78bfa",
};

const STATUS_GLOW: Record<string, string> = {
  active: "#16a34a",
  warn:   "#d97706",
  off:    "#94a3b8",
};

// ── Province analytics + AI feedback ───────────────────
interface ProvBadge   { key: string; label: string; earned: boolean }
interface ProvAnalytics {
  weeklyActive:   number[];   // Mon–Fri active students
  masteryHistory: number[];   // last 7 readings
  weekChange:     number;     // mastery delta vs last week
  schoolsConnected: number;
  badges:         ProvBadge[];
}
interface ProvFeedback {
  summary:        string;
  strengths:      string[];
  challenge:      { area: string; detail: string };
  recommendation: string;
}

function mkProvBadges(mastery: number, weekChange: number, activeRate: number, extra: string[] = []): ProvBadge[] {
  return [
    { key: "top",       label: "Top Mastery",      earned: mastery >= 70           },
    { key: "growth",    label: "Fast Growth",       earned: weekChange >= 3         },
    { key: "engage",    label: "High Engagement",   earned: activeRate >= 40        },
    { key: "leader",    label: "Regional Leader",   earned: extra.includes("leader")},
    { key: "coverage",  label: "Full Coverage",     earned: extra.includes("full")  },
    { key: "consistent",label: "Consistent",        earned: weekChange >= 0 && mastery >= 63 },
  ];
}

const PROVINCE_ANALYTICS: Record<string, ProvAnalytics> = {
  "NCD":            { weeklyActive:[1620,1780,1840,1800,1840], masteryHistory:[68,69,70,71,71,72,72], weekChange:+2, schoolsConnected:38, badges: mkProvBadges(72,2,44,["leader","full"]) },
  "Morobe":         { weeklyActive:[1380,1490,1560,1520,1560], masteryHistory:[65,66,66,67,68,68,68], weekChange:+3, schoolsConnected:52, badges: mkProvBadges(68,3,41,["full"]) },
  "Madang":         { weeklyActive:[920,980,1050,1010,1050],   masteryHistory:[67,68,69,69,70,70,70], weekChange:+2, schoolsConnected:29, badges: mkProvBadges(70,2,40,["leader","full"]) },
  "East Sepik":     { weeklyActive:[860,920,980,950,980],      masteryHistory:[64,65,66,67,67,67,67], weekChange:+1, schoolsConnected:31, badges: mkProvBadges(67,1,41) },
  "West Sepik":     { weeklyActive:[360,390,420,400,420],      masteryHistory:[58,59,59,60,60,60,60], weekChange:+1, schoolsConnected:18, badges: mkProvBadges(60,1,26) },
  "E. Highlands":   { weeklyActive:[1180,1250,1320,1290,1320], masteryHistory:[62,63,64,65,65,66,66], weekChange:+4, schoolsConnected:44, badges: mkProvBadges(66,4,41,["leader"]) },
  "W. Highlands":   { weeklyActive:[1040,1110,1180,1150,1180], masteryHistory:[61,62,63,63,64,64,64], weekChange:+2, schoolsConnected:38, badges: mkProvBadges(64,2,41) },
  "Chimbu":         { weeklyActive:[760,820,860,840,860],      masteryHistory:[62,63,64,64,65,65,65], weekChange:+2, schoolsConnected:24, badges: mkProvBadges(65,2,41) },
  "Enga":           { weeklyActive:[780,840,890,860,890],      masteryHistory:[59,60,61,62,63,63,63], weekChange:+3, schoolsConnected:27, badges: mkProvBadges(63,3,40) },
  "S. Highlands":   { weeklyActive:[980,1050,1120,1090,1120],  masteryHistory:[58,59,59,60,61,61,61], weekChange:+2, schoolsConnected:35, badges: mkProvBadges(61,2,40) },
  "Hela":           { weeklyActive:[460,500,540,520,540],      masteryHistory:[57,57,58,58,59,59,59], weekChange:+1, schoolsConnected:19, badges: mkProvBadges(59,1,30) },
  "Jiwaka":         { weeklyActive:[540,580,620,600,620],      masteryHistory:[61,62,63,64,64,64,64], weekChange:+2, schoolsConnected:20, badges: mkProvBadges(64,2,39) },
  "Central":        { weeklyActive:[680,730,780,760,780],      masteryHistory:[66,67,68,68,69,69,69], weekChange:+2, schoolsConnected:26, badges: mkProvBadges(69,2,39,["full"]) },
  "Gulf":           { weeklyActive:[270,290,320,310,320],      masteryHistory:[56,57,57,57,58,58,58], weekChange:+1, schoolsConnected:14, badges: mkProvBadges(58,1,27) },
  "Milne Bay":      { weeklyActive:[540,580,620,600,620],      masteryHistory:[59,60,61,61,62,62,62], weekChange:+1, schoolsConnected:22, badges: mkProvBadges(62,1,34) },
  "Oro":            { weeklyActive:[140,160,180,170,180],      masteryHistory:[53,54,54,55,55,55,55], weekChange:+1, schoolsConnected:17, badges: mkProvBadges(55,1,12) },
  "Western":        { weeklyActive:[320,350,380,360,380],      masteryHistory:[54,55,55,56,56,56,56], weekChange:+1, schoolsConnected:21, badges: mkProvBadges(56,1,20) },
  "E. New Britain": { weeklyActive:[600,640,680,660,680],      masteryHistory:[70,71,71,72,73,73,73], weekChange:+2, schoolsConnected:21, badges: mkProvBadges(73,2,40,["leader","full"]) },
  "W. New Britain": { weeklyActive:[470,510,540,520,540],      masteryHistory:[65,66,67,67,68,68,68], weekChange:+2, schoolsConnected:17, badges: mkProvBadges(68,2,39) },
  "New Ireland":    { weeklyActive:[390,420,450,430,450],      masteryHistory:[68,69,70,70,71,71,71], weekChange:+2, schoolsConnected:14, badges: mkProvBadges(71,2,41,["full"]) },
  "Manus":          { weeklyActive:[280,300,320,310,320],      masteryHistory:[66,67,68,68,69,69,69], weekChange:+2, schoolsConnected:9,  badges: mkProvBadges(69,2,40,["full"]) },
  "Bougainville":   { weeklyActive:[360,390,420,405,420],      masteryHistory:[62,63,64,64,65,65,65], weekChange:+2, schoolsConnected:16, badges: mkProvBadges(65,2,32) },
};

const PROVINCE_FEEDBACK: Record<string, ProvFeedback> = {
  "NCD": {
    summary: "NCD leads the nation with a 72% mastery average and 1,840 students active today. Consistent daily engagement and strong teacher adoption are driving results above every other province. NCD is the benchmark against which all other provinces should be measured this term.",
    strengths: ["Highest mastery average nationally — 72%, well above the 65% ESP target", "38 schools connected — 100% of targeted schools enrolled and active", "Highest teacher dashboard adoption rate — 91% of registered teachers using the platform weekly"],
    challenge: { area: "Equity within NCD", detail: "Aggregate scores mask a significant internal disparity. Schools in Waigani, Boroko, and Konedobu average 81% mastery; schools in Gordons, Gerehu, and 6-Mile settlements average 61%. The platform is widening rather than closing the NCD equity gap." },
    recommendation: "Direct the NCD Provincial Education Adviser (PEA) to commission a school-level equity audit identifying the 6 underperforming peri-urban schools. Allocate targeted Continuing Professional Development (CPD) funding for Grade 2–3 teachers at those schools under the Department's Teacher Professional Development budget line. Present findings at the next National Literacy and Numeracy Steering Committee meeting as a policy action item."
  },
  "Morobe": {
    summary: "Morobe is the second-largest province by enrolment and is performing solidly at 68% mastery with +3% growth this week — one of the strongest gains nationally. With 52 schools engaged, it has the largest school network in Momase and strong capacity for regional leadership.",
    strengths: ["Fastest mastery growth nationally this week at +3%", "52 schools engaged — the largest provincial school network on the platform", "Morobe PEA has proactively coordinated District Education Officers across all 5 districts"],
    challenge: { area: "Rural school access", detail: "12 of 52 schools are logging intermittent or no sessions this week. These schools, primarily in Markham Valley and Huon Gulf districts, account for the majority of students below 60% mastery. Teacher absenteeism and access barriers are the identified causes." },
    recommendation: "Issue a formal directive to the Morobe PEA requiring District Education Officers in Markham Valley and Huon Gulf to conduct school-level attendance verification within 10 working days. Refer the infrastructure access component to the Department of Works and Implementation through the inter-departmental Education Access Working Group, citing quantified learning loss data. Include Morobe's rural access gap in the next Secretary's quarterly report to the Minister."
  },
  "Madang": {
    summary: "Madang is a standout performer in Momase at 70% mastery — tied for second nationally. Consistent 40%+ active rates throughout the week reflect strong teacher compliance and community awareness. Madang is on track to exceed the ESP Term 2 benchmark.",
    strengths: ["70% mastery — joint second nationally, above the 65% ESP target", "Consistent 40%+ active rate maintained across all five working days", "Madang PEA has established a provincial literacy coordination team that meets fortnightly"],
    challenge: { area: "Coastal and island school access", detail: "4 schools serving coastal and island communities within Madang Province have not logged sessions this week. These communities represent approximately 340 enrolled students. Teacher access to these schools depends on boat transport, which is weather-dependent." },
    recommendation: "Direct the Madang PEA to formally document the 4 affected schools in the provincial School Learning Improvement Plan (SLIP) as requiring alternative delivery support. Raise the access barrier with the Department of Transport as a formal inter-departmental referral. Explore coordination with development partners — DFAT's Education Partnerships initiative has funded similar coastal access programmes in other Pacific nations and may be a viable funding avenue."
  },
  "East Sepik": {
    summary: "East Sepik is progressing steadily at 67% mastery with consistent daily engagement across 31 schools. The province has benefited from strong literacy foundations established through previous community education programmes, giving it a solid base for the platform's numeracy and literacy strands.",
    strengths: ["Consistent 41% active rate maintained throughout the week", "Strong existing literacy baseline from the Sepik Community Literacy Programme", "Active District Education Officer coordination across Maprik, Ambunti, and Wewak districts"],
    challenge: { area: "Device-to-student ratio", detail: "Several schools are operating at a 1:5 or worse device-to-student ratio, requiring classes to rotate access. This limits individual session time and reduces the platform's impact on lower-performing students who tend to get less rotation time." },
    recommendation: "Prioritise East Sepik in the next cycle of the Department's school device allocation under the Digital Education Access programme. Formally request that the Standards and Curriculum Division update the provincial School Learning Improvement Plans to include a device access indicator. In the interim, direct the East Sepik PEA to issue timetabling guidance ensuring equitable rotation that prioritises students below the 60% mastery threshold."
  },
  "West Sepik": {
    summary: "West Sepik (Sandaun) is the most remote province in Momase and faces significant access barriers. At 60% mastery, students who do reach the platform perform reasonably well — the evidence is clear that the issue is access and infrastructure, not student capability or teacher willingness.",
    strengths: ["Students who engage consistently are achieving close to the national mastery average", "Strong provincial government partnership — the West Sepik Administrator has formally endorsed the programme", "Teacher uptake rate among connected schools is high — the limiting factor is connectivity, not adoption"],
    challenge: { area: "Connectivity infrastructure gap", detail: "Only 26% of enrolled students are active today — the lowest active rate in Momase. Platform data shows that schools with reliable connectivity achieve 65%+ mastery, while schools with intermittent access average 48%. The gap is attributable to infrastructure, not pedagogy." },
    recommendation: "Prepare a Ministerial Brief for the Minister for Education quantifying the learning loss caused by the infrastructure deficit in West Sepik, using this platform's session data as evidence. Formally refer the connectivity gap to the Department of Information and Communications Technology (DICT) through the National ICT Education Working Group, requesting West Sepik be included in the next rural connectivity programme cycle. Coordinate with development partners — the World Bank's Rural Education Access component under the PNG Education for All programme is a relevant funding mechanism to explore."
  },
  "E. Highlands": {
    summary: "Eastern Highlands is showing the fastest mastery growth in the Highlands region this week at +4%, reaching 66% average. Strong engagement from the Provincial Education Adviser and consistent District Education Officer coordination across all 6 districts is driving above-average results.",
    strengths: ["Fastest mastery growth in the Highlands this week — +4%, double the national average", "44 schools connected — the largest school network in the Highlands region", "E. Highlands PEA has embedded the platform into the provincial School Learning Improvement Plan cycle"],
    challenge: { area: "Numeracy consolidation gap", detail: "Platform data shows 28% of Grade 2 students across E. Highlands are repeating numeracy tasks — specifically number bonds and addition strategies — across 3 or more sessions without consolidation. This is a systemic pedagogy gap, not an individual student issue." },
    recommendation: "Direct the E. Highlands PEA to convene a provincial Grade 2–3 numeracy professional development session within the current term, prioritising the 12 schools with the highest repeat-task rates. Recommend to the Curriculum Development Division that number bond scaffolding resources be added to the national supplementary materials library. Use E. Highlands as the lead province for a Highlands-wide numeracy improvement initiative — its strong PEA capacity makes it the appropriate regional coordinator."
  },
  "W. Highlands": {
    summary: "Western Highlands is performing consistently at 64% mastery across 38 schools. As the most populous Highlands province, its outcomes carry national significance. Engagement has been stable and week-on-week improvement is steady, though teacher transitions pose a near-term risk to continuity.",
    strengths: ["38 schools connected — strong provincial coverage", "Consistent 41% active rate maintained all week", "PEA-led parent awareness campaign has increased enrolment by 14% this term"],
    challenge: { area: "Teacher transition continuity", detail: "3 of the platform's highest-performing schools in W. Highlands experienced teacher reassignments this term. Platform data shows mastery scores in these schools dropped 8–12% in the weeks following teacher changes, as incoming teachers are unfamiliar with platform integration practices." },
    recommendation: "Direct the W. Highlands PEA to establish a province-level teacher induction protocol requiring all newly assigned teachers to complete platform orientation within their first 2 weeks. Formally request that the Teacher Education Division incorporate digital platform induction into the standard new-teacher deployment checklist. Raise teacher continuity as a systemic issue in the next Secretary's consultative forum — the pattern observed in W. Highlands is likely replicated in other provinces."
  },
  "Chimbu": {
    summary: "Chimbu (Simbu) is performing at 65% mastery — above the Highlands regional average — and maintaining consistent engagement across its 24 connected schools. As a smaller province, it is outperforming relative to its resource allocation and presents a strong efficiency story for the Department.",
    strengths: ["65% mastery — above the Highlands regional average and meeting the ESP Term 2 target", "Low teacher attrition this term — strong workforce stability in connected schools", "Chimbu PEA has successfully integrated the platform into weekly school supervision visits"],
    challenge: { area: "Reading comprehension progression", detail: "Students are progressing through phonics and basic decoding but slowing significantly at inferential comprehension tasks. Platform data shows 34% of students in Chimbu are spending disproportionate time on Chapter 3 comprehension activities. This is a teaching methodology gap — teachers are strong on phonics instruction but less confident in comprehension strategy teaching." },
    recommendation: "Commission a targeted CPD workshop for Chimbu Grade 2–3 teachers focused on comprehension strategy instruction — specifically questioning techniques, think-alouds, and oral retelling. Coordinate with the Curriculum Development Division to ensure the comprehension strategy workshop aligns with the national Literacy and Numeracy Plan (LNP) methodology. Chimbu's PEA capacity and small scale make it an ideal province to pilot a comprehension-focused teacher coaching model before scaling to larger provinces."
  },
  "Enga": {
    summary: "Enga has shown strong improvement this week at +3% mastery growth, reaching 63%. Once one of the more challenging provinces for platform adoption due to remoteness and gender access issues, Enga is now demonstrating measurable progress and is an emerging Highlands success story.",
    strengths: ["One of the strongest mastery growth rates in the Highlands this week (+3%)", "Provincial Administrator has formally co-endorsed the programme alongside the Education Department", "Good progress on the numeracy strand — number bond mastery up 9% since last term"],
    challenge: { area: "Gender participation gap", detail: "Platform data shows female student active rates in Enga are 18% lower than male rates. In schools with shared devices, session logs indicate boys access devices more frequently during unstructured periods. This represents a systemic equity issue requiring a policy response, not just a school-level adjustment." },
    recommendation: "Direct the Enga PEA to include a gender equity indicator in the provincial School Learning Improvement Plans, requiring schools to report on female-to-male active session ratios each term. Engage the Department's Gender Equity in Education unit to develop a gender-responsive timetabling guideline for shared-device schools. Coordinate with the Enga Provincial Women's Representative to raise awareness through community channels — a policy directive alone will not be sufficient without community buy-in."
  },
  "S. Highlands": {
    summary: "Southern Highlands is a large, geographically complex province making solid progress at 61% mastery with 35 schools connected. Consistent week-on-week improvement and strong inter-governmental coordination put it on track to reach the 65% ESP target by end of term if current trajectory holds.",
    strengths: ["35 schools connected — strong provincial coverage for a geographically dispersed province", "Consistent week-on-week mastery improvement across consecutive terms", "PEA has established formal monthly reporting with all 5 District Education Officers"],
    challenge: { area: "Geographic access affecting teacher attendance", detail: "Platform session data shows significant drop-offs at schools in the Tari Basin and Kagua-Erave districts on days with poor road conditions. Teacher attendance at these schools is weather-dependent and road-access dependent. The platform cannot be effective when teacher-facilitated sessions are inconsistent." },
    recommendation: "Request that the Standards and Curriculum Division issue formal guidance on teacher-independent learning protocols for geographically isolated schools in S. Highlands — enabling students to access structured offline activities on days when teacher-led sessions are not possible. Direct the S. Highlands PEA to map the specific schools affected by road access constraints and include this data in the Department's annual infrastructure needs submission to the Department of Works."
  },
  "Hela": {
    summary: "Hela is the most recently gazetted province and faces unique institutional capacity challenges. At 59% mastery among those who engage, students are capable — but a 30% active rate reflects the province's foundational infrastructure and workforce capacity gaps that the Education Department must address as a priority.",
    strengths: ["Students who engage consistently are achieving close to the Highlands regional average", "Hela PEA has formally committed to the platform as a provincial literacy priority", "Week-on-week improvement trend — mastery up +1% despite access challenges"],
    challenge: { area: "Foundational infrastructure and connectivity", detail: "Hela has the lowest school connectivity rate in the Highlands. 8 of 19 connected schools experienced connectivity outages this week, disrupting scheduled sessions. As the newest province, Hela has the least developed education infrastructure and the smallest DEO capacity of any Highlands province." },
    recommendation: "Prepare a formal Infrastructure Needs Assessment for Hela Province for submission to the National Planning Committee and the Department of Works, using platform session data to quantify the educational cost of connectivity outages. Direct the Hela PEA to distribute the Department's approved supplementary printed learning materials to all schools as a non-connectivity backup. Prioritise Hela for the next round of DEO capacity-building funded under the Education Management Improvement programme."
  },
  "Jiwaka": {
    summary: "Jiwaka is one of PNG's newest provinces and is outperforming expectations at 64% mastery. Motivated provincial education leadership and consistent DEO engagement across both districts are producing strong results proportional to the province's size and resource base.",
    strengths: ["64% mastery — above the Highlands regional average despite being one of the smallest provinces", "Active rate consistent across all five days this week — strong teacher compliance", "Jiwaka PEA is among the most responsive to Department directives in the Highlands region"],
    challenge: { area: "Shared facility timetabling", detail: "Several Jiwaka schools operate in shared or incomplete facilities, leading to timetabling conflicts that reduce the number of device access hours available per student per week. Some students are receiving fewer than the recommended 3 platform sessions per week due to scheduling constraints." },
    recommendation: "Direct the Jiwaka PEA to implement a standardised weekly timetabling framework — developed in consultation with the Curriculum Development Division — ensuring a minimum of 3 dedicated platform sessions per student per week. Include Jiwaka in the Department's school infrastructure audit for FY2026-27, flagging the shared-facility constraint as a budget priority for the next capital works allocation cycle."
  },
  "Central": {
    summary: "Central Province is the second-highest performing province nationally at 69% mastery, benefiting from proximity to NCD infrastructure and a strong teacher workforce. It is meeting and slightly exceeding the ESP Term 2 benchmark and represents a reliable high performer for the Department.",
    strengths: ["69% mastery — second highest nationally, exceeding the 65% ESP Term 2 target", "26 schools with full and consistent connectivity", "Central PEA has established a co-mentoring arrangement with NCD teachers that is improving pedagogical quality"],
    challenge: { area: "Mastery plateau risk", detail: "Central is showing signs of a mastery growth plateau (+2% this week, down from +4% last term). A cohort of students in 8 schools are approaching Chapter 5 checkpoints and may require differentiated extension activities to maintain progress. Without curriculum extension, high-performing students risk disengagement." },
    recommendation: "Direct the Curriculum Development Division to fast-track the release of Grade 3 extension content modules for Central Province as a pilot, enabling above-benchmark students to progress without waiting for the full national rollout. Direct the Central PEA to identify and formally report the cohort of students approaching the Chapter 5 plateau — this data will inform the Department's differentiated curriculum policy for accelerated learners."
  },
  "Gulf": {
    summary: "Gulf Province has significant untapped potential — students who access the platform perform near the national average at 58% mastery — but a 27% active rate means the majority of enrolled students are not benefiting. The Department's role is to identify and address the barriers preventing access, not the quality of delivery.",
    strengths: ["Students who do access consistently are performing near the national average", "Gulf PEA has maintained teacher engagement despite access challenges", "Strong oral literacy tradition in Gulf communities provides a solid foundation for the literacy strand"],
    challenge: { area: "Coastal and delta access barriers", detail: "Gulf's delta and coastline geography makes reliable access to schools extremely difficult for both students and teachers. Platform session data shows active rates have not exceeded 30% in any week this term. This is a structural access problem — the Department cannot solve it through educational interventions alone." },
    recommendation: "Prepare a cross-departmental access brief for the Secretary for Education documenting Gulf Province's access barriers and their quantified impact on learning outcomes. Formally refer the access issue to the Department of Transport and Infrastructure through the Education-Infrastructure Working Group. Explore ADB's Rural Access to Education Fund as a potential development partner funding mechanism. In the interim, direct the Gulf PEA to deploy the Department's supplementary printed materials to all schools to ensure minimum learning continuity."
  },
  "Milne Bay": {
    summary: "Milne Bay is a widely dispersed archipelago province performing at 62% mastery among active students. The province has strong teacher engagement and an active provincial education board — the primary barrier is island geography limiting consistent school access, not education system capacity.",
    strengths: ["Students who engage are progressing well and approaching the national mastery average", "Growing teacher-to-teacher peer support network across the archipelago", "Milne Bay Provincial Education Board is actively engaged and co-funding the programme"],
    challenge: { area: "Island school access", detail: "9 of 22 connected schools are on islands without reliable mainland connectivity. These schools account for 68% of inactive enrolled students. Teachers and students on outer islands face weather-dependent access constraints that no timetabling or pedagogical adjustment can resolve." },
    recommendation: "Direct the Milne Bay PEA to formally document the 9 island schools as 'restricted access' in the provincial School Learning Improvement Plan, triggering the Department's alternative delivery protocol. Submit a formal request to the Department of Transport to assess marine transport options for school supervision visits to outer island schools — current DEO visit frequency is insufficient. Raise Milne Bay as a case study for island province access policy at the next PNG Education Sector Partners meeting."
  },
  "Oro": {
    summary: "Oro Province is the most urgent intervention priority nationally. A 12% active rate and 55% mastery are significantly below all benchmarks, and the gap is widening. Platform data indicates the causes are multi-factor: teacher capacity, community access barriers, and inconsistent school supervision. Immediate departmental action is required.",
    strengths: ["Oro Provincial Education Office has confirmed willingness to engage with a structured intervention plan", "Students who do access the platform are making incremental progress", "NGO networks in Oro — including CARE PNG and World Vision — are active and available for coordination"],
    challenge: { area: "Multi-factor systemic underperformance", detail: "Only 5 of 17 connected schools have consistent weekly sessions. Teacher confidence with the platform is low — most teachers in Oro received no structured onboarding. Community attendance rates are also below provincial averages. No single intervention will address this — a coordinated package is required." },
    recommendation: "Escalate Oro Province to the Secretary for Education immediately for a formal Ministerial Brief. Issue a directive to the Oro PEA requiring submission of a written Provincial Intervention Plan within 5 working days, covering: (1) teacher capacity-building schedule, (2) school supervision increase plan, and (3) community mobilisation approach. Commission an in-person visit by the Standards and Curriculum Division within 2 weeks to conduct school-level assessments. Engage the Department's development partners — DFAT and World Vision — for co-funded community education support in Oro."
  },
  "Western": {
    summary: "Western Province is the largest by land area and the second most critical intervention priority after Oro. A 20% active rate and 56% mastery reflect genuine geographic isolation challenges. The Department's approach must be realistic about what education policy alone can achieve given the province's infrastructure deficit.",
    strengths: ["Students who connect are demonstrating motivation and making progress", "Western Provincial Government has expressed willingness to co-invest in the programme", "Community leaders across Fly River and South Fly districts are actively supporting student enrolment"],
    challenge: { area: "Geographic isolation limiting all delivery modes", detail: "Western Province covers nearly 100,000 km². Many communities are accessible only by air or river. 8 of 21 connected schools have not logged sessions this week — not due to teacher unwillingness but due to physical access barriers that make school supervision visits by DEOs practically impossible at current resourcing levels." },
    recommendation: "Direct the Western PEA to formally classify the 8 non-active schools under the Department's 'Remote Access' school category, unlocking the alternative delivery budget allocation. Submit Western Province's access data to the National Planning Committee as part of the Department's infrastructure equity case for the 2026-27 budget cycle. Formally request DFAT's Partnerships for Development programme consider Western Province for a dedicated rural education access component — the province's isolation profile is consistent with programmes DFAT has funded in Solomon Islands and Vanuatu."
  },
  "E. New Britain": {
    summary: "Eastern New Britain is the top-performing island province at 73% mastery and third-highest nationally. Strong infrastructure in Kokopo and Rabaul, high teacher literacy, and active school leadership are producing outcomes that the Department should formally recognise and learn from.",
    strengths: ["73% mastery — highest in the Islands region, third nationally", "21 schools with consistent and reliable connectivity", "E. New Britain PEA has been recognised internally as a model of provincial education management"],
    challenge: { area: "Curriculum ceiling for high performers", detail: "High-performing students in E. New Britain are completing Grade 2–3 modules at a rate faster than the current curriculum allows. Without extension content, these students plateau and risk disengagement. The province is ready for differentiated curriculum delivery that the platform does not yet fully support." },
    recommendation: "Formally engage the Curriculum Development Division to prioritise E. New Britain as the pilot province for Grade 3–4 curriculum extension content. This province has the teacher capacity, connectivity, and PEA management quality to run a successful pilot. Prepare a brief for the Secretary recommending that E. New Britain's outcomes be presented at the next Inter-Provincial Education Ministers Meeting as a replication model for other provinces."
  },
  "W. New Britain": {
    summary: "Western New Britain is performing solidly at 68% mastery with consistent engagement across 17 schools. The province has demonstrated an effective model of private sector partnership for device funding, and its DEO coordination is among the most structured in the Islands region.",
    strengths: ["68% mastery — strong Islands region performer", "Private sector device co-funding model with oil palm companies is sustainable and replicable", "Consistent week-on-week improvement across all districts"],
    challenge: { area: "Teacher attendance on Fridays", detail: "Session data shows a consistent 35% drop in platform activity on Fridays across 6 schools. Cross-referencing with DEO records suggests this correlates with teacher attendance patterns — specifically, teachers in these schools are not present at school on Fridays at the same rate as Monday–Thursday." },
    recommendation: "Direct the W. New Britain PEA to investigate and formally report on Friday teacher attendance patterns at the 6 affected schools within 15 working days. Where absenteeism is confirmed, direct District Education Officers to apply the Department's Teacher Attendance Policy consistently. Recommend the private sector device co-funding model used in W. New Britain to the Department's resource mobilisation team as a replicable framework for other resource-sector provinces."
  },
  "New Ireland": {
    summary: "New Ireland is one of the most consistent national performers at 71% mastery, with all 14 connected schools showing regular weekly engagement. The province exceeds the ESP Term 2 target and its model — strong PEA leadership, community support, and church network coordination — is directly replicable.",
    strengths: ["71% mastery — second in the Islands region, above the ESP Term 2 target", "All 14 connected schools are actively engaged every week — 100% school participation rate", "Strong church and community network coordination has driven family engagement with the programme"],
    challenge: { area: "Enrolment expansion capacity", detail: "New Ireland has reached the practical ceiling of its current connected school network. 450 active students from 1,100 enrolled represents a genuine engagement floor — the remaining 650 students are enrolled but have no connected school to access the platform through. Growth requires new school connections, not pedagogical improvement." },
    recommendation: "Direct the New Ireland PEA to identify and formally propose 3–5 additional schools for platform connection in Term 3, with a readiness assessment submitted to the Department's Digital Education unit within 30 days. New Ireland's strong track record justifies fast-tracking the connection process. Commission a formal documentation of New Ireland's community engagement model — specifically the church network coordination approach — for distribution to other Islands region provinces as a replication guide."
  },
  "Manus": {
    summary: "Manus is a small island province achieving 69% mastery with all 9 connected schools actively engaged. Its proportional performance is among the strongest in the country. The Manus model — full school coverage, high community awareness, and active parental engagement — is exactly what the Department should be replicating nationally.",
    strengths: ["69% mastery — strong performance for a small island province", "All 9 connected schools are actively engaged — 100% school participation rate", "Parental engagement and community awareness are the highest of any province in the Islands region"],
    challenge: { area: "Limited expansion capacity within province", detail: "Manus has effectively maximised its current school network coverage. Further improvements within Manus require curriculum depth and teacher development, not additional school connections. The province's greatest value to the Department is now as a replication model, not as a growth target." },
    recommendation: "Formally commission the Manus PEA to document the province's community engagement and teacher coordination approach as a nationally distributable case study. Direct the Teacher Education Division to engage Manus teachers as peer mentors under a formal inter-provincial mentoring scheme — prioritising West Sepik and Hela, which have the most to gain from Manus's community mobilisation approach. Present the Manus model at the next National Education Standards Forum as evidence of what is achievable in a small island province with adequate support."
  },
  "Bougainville": {
    summary: "Bougainville (AROB) is performing at 65% mastery with steady growth. As an autonomous region managing its own education agenda under the Bougainville Peace Agreement, the National Department's role is facilitative — providing curriculum resources, national benchmarking, and technical support — while respecting AROB's constitutional education authority.",
    strengths: ["65% mastery and growing — on track to meet the ESP Term 2 target by end of term", "Strong AROB Department of Education co-ownership — the programme is embedded in the Bougainville Education Strategic Plan", "Local language content integration has built community trust and increased enrolment"],
    challenge: { area: "Interior community access", detail: "4 schools in interior Bougainville communities have not connected this term. Historical conflict legacy and limited road infrastructure in the Panguna corridor area are contributing factors. These communities require trust-building approaches alongside technical solutions." },
    recommendation: "Formally engage the AROB Department of Education through the Joint Ministerial Forum to develop a coordinated interior access strategy — the National Department must act as a partner, not a director, given AROB's constitutional status. Recommend that AROB's community reconciliation programmes formally incorporate education access as a component, using the platform as a visible symbol of development investment. Explore whether the Bougainville Peace Programme (BPP) development partner fund can co-finance education access in the 4 unconnected interior communities."
  },
};

// ── Province drawer visual components ──────────────────
const PROV_DAYS = ["M","T","W","T","F"];

function ProvWeeklyChart({ active }: { active: number[] }) {
  const max = Math.max(...active, 1);
  const total = active.reduce((a,b) => a+b, 0);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:52 }}>
        {active.map((v,i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ fontSize:9, fontWeight:800, color: v===Math.max(...active)?"#1a2e4a":"#6b7280" }}>
              {(v/1000).toFixed(1)}k
            </div>
            <motion.div
              initial={{ height:0 }}
              animate={{ height:(v/max)*34 }}
              transition={{ duration:0.5, delay:i*0.07, ease:"easeOut" }}
              style={{
                width:"100%",
                background: v===Math.max(...active)
                  ? "linear-gradient(180deg,#F5A623,#E84D2A)"
                  : "linear-gradient(180deg,#60a5fa,#1a2e4a)",
                borderRadius:"3px 3px 0 0",
                minHeight:3,
              }}
            />
            <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af" }}>{PROV_DAYS[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:10, color:"#6b7280", fontWeight:700, marginTop:6, textAlign:"right" }}>
        {total.toLocaleString()} total active this week
      </div>
    </div>
  );
}

function ProvSparkline({ history, color }: { history: number[]; color: string }) {
  const W=200, H=44, pad=4;
  const min=Math.min(...history)-3, max=Math.max(...history)+3;
  const pts=history.map((v,i)=>{
    const x=pad+(i/(history.length-1))*(W-pad*2);
    const y=H-pad-((v-min)/(max-min))*(H-pad*2);
    return `${x},${y}`;
  }).join(" ");
  const lx=pad+(W-pad*2), ly=H-pad-((history[history.length-1]-min)/(max-min))*(H-pad*2);
  const trend=history[history.length-1]-history[0];
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontSize:10, color:"#9ca3af", fontWeight:700 }}>7-Week Trend</span>
        <span style={{ fontSize:10, fontWeight:900, color: trend>0?"#16a34a":trend<0?"#dc2626":"#6b7280" }}>
          {trend>0?`▲ +${trend}%`:trend<0?`▼ ${trend}%`:"▬ Stable"}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id={`pg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`${pad},${H} ${pts} ${lx},${H}`} fill={`url(#pg-${color.replace("#","")})`}/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={lx} cy={ly} r="3.5" fill={color}/>
      </svg>
    </div>
  );
}

const PROV_BADGE_DEFS: Record<string, { icon: React.FC<{c:string}>; earnedColor:string; bg:string; border:string }> = {
  top:        { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 01-2-2V5h4"/><path d="M18 9h2a2 2 0 002-2V5h-4"/><path d="M6 3h12v6a6 6 0 01-12 0V3z"/><path d="M9 21h6"/><path d="M12 15v6"/><path d="M8 21h8"/></svg>, earnedColor:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  growth:     { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, earnedColor:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
  engage:     { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill={c}><path d="M12 2c0 0-5 5.5-5 10a5 5 0 0010 0c0-2.5-1.5-4.5-2.5-6 0 2-1 3.5-2.5 4 1-2 0-5-1.5-6.5C10.5 5 12 2 12 2z"/></svg>, earnedColor:"#E84D2A", bg:"#fff7ed", border:"#fed7aa" },
  leader:     { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill={c}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, earnedColor:"#F5A623", bg:"#fffbeb", border:"#fde68a" },
  coverage:   { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, earnedColor:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
  consistent: { icon:({c})=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, earnedColor:"#0891b2", bg:"#ecfeff", border:"#a5f3fc" },
};

function ProvBadgeChip({ badge }: { badge: ProvBadge }) {
  const def = PROV_BADGE_DEFS[badge.key];
  if (!def) return null;
  const { icon: Icon, earnedColor, bg, border } = def;
  const col = badge.earned ? earnedColor : "#d1d5db";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"5px 10px", borderRadius:50,
      background: badge.earned ? bg : "#f9fafb",
      border:`1px solid ${badge.earned ? border : "#e5e7eb"}`,
      opacity: badge.earned ? 1 : 0.45,
    }}>
      <Icon c={col}/>
      <span style={{ fontSize:10, fontWeight:800, color: badge.earned ? earnedColor : "#9ca3af", letterSpacing:0.2 }}>
        {badge.label}
      </span>
    </div>
  );
}

// ── Province Drawer ─────────────────────────────────────
type ProvRow = (typeof PROVINCES)[0];

function ProvinceDrawer({ province, onClose }: { province: ProvRow; onClose: () => void }) {
  const an  = PROVINCE_ANALYTICS[province.name];
  const fb  = PROVINCE_FEEDBACK[province.name];
  const col = STATUS_GLOW[province.status];
  const rc  = REGION_COLORS[province.region];
  const masteryCol = province.mastery>=70 ? C.green : province.mastery>=63 ? C.amber : C.red;
  const activeRate = Math.round((province.active/province.students)*100);

  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.2)", zIndex:200 }}
      />
      <motion.div
        initial={{x:500}} animate={{x:0}} exit={{x:500}}
        transition={{ type:"spring", damping:28, stiffness:280 }}
        style={{
          position:"fixed", top:0, right:0, bottom:0, width:480,
          background:"#fff", boxShadow:"-4px 0 32px rgba(0,0,0,0.1)",
          zIndex:201, display:"flex", flexDirection:"column",
          fontFamily:"'Times New Roman', serif", overflowY:"auto",
        }}
      >
        {/* Header */}
        <div style={{ background:C.navy, padding:"20px 24px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
          <div style={{
            width:48, height:48, borderRadius:10,
            background:`${rc}25`, border:`2px solid ${rc}60`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:900, color:rc,
            fontFamily:"'Times New Roman', serif", flexShrink:0,
          }}>{province.name.charAt(0)}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:"'Times New Roman', serif" }}>{province.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
              <span style={{ fontSize:10, fontWeight:800, color:rc, background:`${rc}25`, borderRadius:4, padding:"2px 8px" }}>
                {province.region}
              </span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:700 }}>
                {province.students.toLocaleString()} enrolled · {province.mastery}% mastery
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.1)", border:"none", borderRadius:6,
            width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:"rgba(255,255,255,0.7)", fontSize:18, lineHeight:1,
          }}>×</button>
        </div>

        {/* Mastery bar */}
        <div style={{ padding:"14px 24px", borderBottom:`1px solid #f3f4f6`, background:"#fafafa" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:10, fontWeight:900, color:"#9ca3af", letterSpacing:0.6, textTransform:"uppercase" }}>Mastery Progress</span>
            <span style={{ fontSize:11, fontWeight:900, color:masteryCol }}>{province.mastery}%</span>
          </div>
          <div style={{ height:8, background:"#e5e7eb", borderRadius:4, overflow:"hidden" }}>
            <motion.div
              initial={{width:0}} animate={{width:`${province.mastery}%`}}
              transition={{ duration:0.7, ease:"easeOut" }}
              style={{ height:"100%", background:`linear-gradient(90deg,${masteryCol}99,${masteryCol})`, borderRadius:4 }}
            />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
            <span style={{ fontSize:10, color:"#9ca3af" }}>{province.active.toLocaleString()} active today</span>
            <span style={{ fontSize:10, color:"#9ca3af" }}>{an?.schoolsConnected ?? "—"} schools connected</span>
          </div>
        </div>

        {/* Analytics */}
        {an && (() => {
          const wkChange = an.weekChange;
          return (
            <div style={{ padding:"14px 24px 4px", display:"flex", flexDirection:"column", gap:12 }}>

              {/* Stat pills */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {[
                  { label:"Active Rate",   value:`${activeRate}%`,          color: activeRate>=40?"#16a34a":activeRate>=30?"#d97706":"#dc2626" },
                  { label:"Week Change",   value: wkChange>=0?`+${wkChange}%`:`${wkChange}%`, color: wkChange>0?"#16a34a":wkChange<0?"#dc2626":"#6b7280" },
                  { label:"Schools",       value:`${an.schoolsConnected}`,   color:"#2563eb"  },
                  { label:"Status",        value: province.status==="active"?"Online":province.status==="warn"?"Partial":"Offline", color:col },
                ].map(s=>(
                  <div key={s.label} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:14, fontWeight:900, color:s.color, fontFamily:"'Times New Roman', serif", lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", marginTop:4, textTransform:"uppercase", letterSpacing:0.4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:900, color:"#374151", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Weekly Activity</div>
                  <ProvWeeklyChart active={an.weeklyActive}/>
                </div>
                <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:900, color:"#374151", marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>Mastery Trend</div>
                  <ProvSparkline history={an.masteryHistory} color={masteryCol}/>
                </div>
              </div>

              {/* Badges */}
              {an.badges.some(b=>b.earned) && (
                <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, fontWeight:900, color:"#374151", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>
                    Achievements <span style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"none" }}>({an.badges.filter(b=>b.earned).length} earned)</span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {an.badges.map(b=><ProvBadgeChip key={b.key} badge={b}/>)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* AI Feedback */}
        {fb && (
          <div style={{ padding:"14px 24px 24px", display:"flex", flexDirection:"column", gap:12 }}>
            {/* AI header */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <div style={{ width:26, height:26, borderRadius:6, background:"linear-gradient(135deg,#1a2e4a,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 017 4.5A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v1a2 2 0 002 2h.5A2.5 2.5 0 017 14.5A2.5 2.5 0 019.5 17H10v3a2 2 0 004 0v-3h.5A2.5 2.5 0 0117 14.5A2.5 2.5 0 0119.5 12H20a2 2 0 002-2V9a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 4.5A2.5 2.5 0 0114.5 2h-5z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:900, color:"#111827" }}>AI Province Intelligence</div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>Based on live session data · Generated today</div>
              </div>
              <div style={{ marginLeft:"auto", fontSize:9, fontWeight:800, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:50, padding:"2px 8px", color:"#2563eb" }}>AI INSIGHT</div>
            </div>

            {/* Summary */}
            <p style={{ margin:0, fontSize:12.5, color:"#111827", lineHeight:1.75, fontWeight:600, background:"#f9fafb", borderRadius:8, padding:"12px 14px", border:"1px solid #e5e7eb" }}>
              {fb.summary}
            </p>

            {/* Strengths */}
            <div style={{ border:"1px solid #bbf7d0", borderRadius:8, background:"#f0fdf4", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #bbf7d0" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:11, fontWeight:900, color:"#16a34a", letterSpacing:0.4 }}>STRENGTHS</span>
              </div>
              <ul style={{ margin:0, padding:"10px 14px 10px 28px", display:"flex", flexDirection:"column", gap:6 }}>
                {fb.strengths.map((s,i)=>(
                  <li key={i} style={{ fontSize:12, color:"#166534", lineHeight:1.55, fontWeight:600 }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Challenge */}
            <div style={{ border:"1px solid #fed7aa", borderRadius:8, background:"#fff7ed", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #fed7aa" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize:11, fontWeight:900, color:"#d97706", letterSpacing:0.4 }}>CHALLENGE AREA</span>
                <span style={{ marginLeft:"auto", fontSize:10, fontWeight:800, background:"#fef3c7", border:"1px solid #fde68a", borderRadius:50, padding:"1px 8px", color:"#92400e" }}>{fb.challenge.area}</span>
              </div>
              <p style={{ margin:0, padding:"10px 14px", fontSize:12, color:"#92400e", lineHeight:1.65, fontWeight:600 }}>{fb.challenge.detail}</p>
            </div>

            {/* Recommendation */}
            <div style={{ border:"1px solid #bfdbfe", borderRadius:8, background:"#eff6ff", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #bfdbfe" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>
                <span style={{ fontSize:11, fontWeight:900, color:"#2563eb", letterSpacing:0.4 }}>RECOMMENDED ACTION</span>
              </div>
              <p style={{ margin:0, padding:"10px 14px", fontSize:12, color:"#1e40af", lineHeight:1.65, fontWeight:600 }}>{fb.recommendation}</p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ── National totals ─────────────────────────────────────
const NATIONAL = {
  enrolled:    47_800,
  activeToday: 18_540,
  sessions:    312_000,
  avgMastery:  65,
  provinces:   22,
  schools:     843,
};

// ── Live activity events ─────────────────────────────────
const LIVE_EVENTS = [
  { province: "NCD",        text: "Grade 2 student completed Chapter 4 · Phonics",    type: "milestone" },
  { province: "Morobe",     text: "New school registered — Lae Primary",               type: "info" },
  { province: "E. Highlands",text:"14 students active simultaneously",                 type: "activity" },
  { province: "Madang",     text: "Class mastery crossed 70% — term milestone",        type: "milestone" },
  { province: "NCD",        text: "Ms. Karo's Grade 2 session started",                type: "activity" },
  { province: "E. New Britain",text:"Grade 3 cohort uploaded — 38 new students",       type: "info" },
  { province: "Chimbu",     text: "Student completed first 10 sessions — streak badge",type: "milestone" },
  { province: "W. Highlands",text:"AI flagged 2 students for reading intervention",    type: "alert" },
  { province: "Manus",      text: "Island school reconnected after 2-day outage",       type: "info" },
  { province: "Morobe",     text: "National rank: Morobe moved to #2 province",        type: "milestone" },
  { province: "East Sepik", text: "Grade 1 literacy pilot: 94% task completion",       type: "activity" },
  { province: "S. Highlands",text:"Teacher logged AI insight report — 3 referrals",    type: "info" },
  { province: "NCD",        text: "Platform uptime: 99.97% — all nodes healthy",       type: "info" },
  { province: "Hela",       text: "Attendance alert: 8 students absent 3+ days",       type: "alert" },
  { province: "E. Highlands",text:"End-of-term checkpoint: 78% students passed",       type: "milestone" },
  { province: "New Ireland", text: "New teacher dashboard activated — 1 teacher",      type: "info" },
  { province: "Bougainville",text: "Grade 2 cohort: avg mastery +6% this week",        type: "milestone" },
  { province: "Central",    text: "AI generated 22 student feedback reports",          type: "activity" },
];

const EVENT_COLOR: Record<string, string> = {
  milestone: "#d97706",
  info:      "#6b7280",
  activity:  "#2563eb",
  alert:     "#dc2626",
};

// ── AI National Intelligence ─────────────────────────────
const AI_REPORT = {
  summary: "National literacy engagement is at its highest point since the platform's launch, with 38.8% of enrolled students active today across 20 of 22 provinces. The Highlands region is showing the strongest week-on-week mastery growth (+4.2%), driven by improved internet access in Enga and S. Highlands. Two provinces — Oro and Gulf — remain significantly below national benchmarks and require targeted infrastructure or community engagement investment.",
  flags: [
    { color: C.green,  label: "NCD Leading",         text: "NCD continues to outperform all provinces. 1,840 students active today. Avg mastery 72%. Recommend as national pilot case study." },
    { color: C.gold,   label: "Highlands Surge",      text: "Highlands enrolment up 12% vs last term. Mastery growth fastest in E. Highlands. Community radio partnerships likely driving uptake." },
    { color: C.amber,  label: "Connectivity Gap",     text: "West Sepik and Hela showing 30–40% lower active rates despite enrolment. Intermittent internet coverage suspected. Solar router deployment recommended." },
    { color: C.red,    label: "Oro Province Critical",text: "Only 12% active rate — 180 of 1,500 enrolled. Last checkpoint failed for 68% of students. Requires urgent field visit and community mobilisation." },
  ],
};

// ── Helpers ─────────────────────────────────────────────
function useCountUp(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

// ── SVG Icons ────────────────────────────────────────────
const IcoUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoActivity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IcoBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const IcoTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcoGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IcoSchool = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcoBrain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v1a2 2 0 002 2h.5A2.5 2.5 0 017 14.5v0A2.5 2.5 0 019.5 17H10v3a2 2 0 004 0v-3h.5A2.5 2.5 0 0117 14.5v0A2.5 2.5 0 0119.5 12H20a2 2 0 002-2V9a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0114.5 2h-5z"/>
  </svg>
);

const IcoMap = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IcoList = ({ color }: { color: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

// ── KPI Card ─────────────────────────────────────────────
function KpiCard({ icon, label, value, unit = "", color, delay = 0 }: {
  icon: React.ReactNode; label: string; value: number; unit?: string; color: string; delay?: number;
}) {
  const v = useCountUp(value, 1400 + delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.45 }}
      style={{
        flex: 1, minWidth: 120,
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderTop: `2px solid ${color}`,
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div style={{ color, marginBottom: 8, opacity: 0.85 }}>{icon}</div>
      <div style={{
        fontSize: 30, fontWeight: 900, color: C.text,
        fontFamily: "'Times New Roman', serif", lineHeight: 1, letterSpacing: -1,
      }}>
        {fmt(v)}{unit}
      </div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 5, textTransform: "uppercase", letterSpacing: 0.7 }}>
        {label}
      </div>
    </motion.div>
  );
}

// ── PNG Province Map (real GADM paths, choropleth) ───────
function PngMap({ onHover, hovered, onSelect }: {
  onHover:  (geoName: string | null) => void;
  hovered:  string | null;
  onSelect: (geoName: string) => void;
}) {
  return (
    <svg
      viewBox="0 0 600 385"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <filter id="provglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dotglow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="mapbg2" cx="40%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Subtle background wash */}
      <ellipse cx="280" cy="210" rx="290" ry="180" fill="url(#mapbg2)"/>

      {/* ── Filled province paths (choropleth) ── */}
      {PNG_PROVINCE_GEO.map(geo => {
        const stats   = statsForGeo(geo.name);
        const isHov   = hovered === geo.name;
        const fill    = stats
          ? provinceColor(stats.mastery, stats.active, stats.students, stats.status)
          : "rgba(71,85,105,0.3)";
        const stroke  = isHov ? "rgba(26,46,74,0.75)" : "rgba(26,46,74,0.25)";
        const strokeW = isHov ? "1.8" : "0.7";

        return (
          <g
            key={geo.name}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(geo.name)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(geo.name)}
            filter={isHov ? "url(#provglow)" : undefined}
          >
            {geo.paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                strokeLinejoin="round"
                style={{ transition: "fill 0.2s, stroke 0.15s" }}
              />
            ))}
          </g>
        );
      })}

      {/* ── Centroid pulse rings (active provinces) ── */}
      {PNG_PROVINCE_GEO.map(geo => {
        const stats = statsForGeo(geo.name);
        if (!stats || stats.status !== "active") return null;
        return (
          <motion.circle
            key={`pulse-${geo.name}`}
            cx={geo.cx} cy={geo.cy} r={5}
            fill="none"
            stroke={C.green}
            strokeWidth="1"
            animate={{ r: [4, 14], opacity: [0.7, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              delay: (geo.cx % 7) * 0.3,
              ease: "easeOut",
            }}
            style={{ pointerEvents: "none" }}
          />
        );
      })}

      {/* ── Centroid dots ── */}
      {PNG_PROVINCE_GEO.map(geo => {
        const stats  = statsForGeo(geo.name);
        const isHov  = hovered === geo.name;
        const color  = stats ? STATUS_GLOW[stats.status] : C.slate;
        const dispName = stats?.name ?? geo.name;

        return (
          <g key={`dot-${geo.name}`} style={{ pointerEvents: "none" }}>
            <circle
              cx={geo.cx} cy={geo.cy}
              r={isHov ? 5 : 3}
              fill={color}
              opacity={stats?.status === "off" ? 0.4 : 0.95}
              filter={isHov ? "url(#dotglow)" : undefined}
              style={{ transition: "r 0.15s" }}
            />
            {/* Hover label */}
            {isHov && (
              <g>
                <rect
                  x={geo.cx + 7} y={geo.cy - 20}
                  width={dispName.length * 6.4 + 14}
                  height={18}
                  rx="4"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.12))" }}
                />
                <text
                  x={geo.cx + 14} y={geo.cy - 8}
                  fontSize="10" fill="#111827"
                  fontWeight="800"
                  fontFamily="Times New Roman, serif"
                >
                  {dispName}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ── Mastery legend ── */}
      <g transform="translate(4, 368)">
        {[
          { label: "≥70%", color: "rgba(34,197,94,0.75)"  },
          { label: "63–69%", color: "rgba(245,166,35,0.75)" },
          { label: "55–62%", color: "rgba(251,191,36,0.6)"  },
          { label: "<55%",  color: "rgba(239,68,68,0.70)"  },
          { label: "Offline", color: "rgba(71,85,105,0.5)" },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(${i * 110}, 0)`}>
            <rect width="12" height="10" rx="2" fill={item.color}/>
            <text x="16" y="9" fontSize="9" fill={C.muted} fontWeight="700" fontFamily="Times New Roman, serif">
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Province tooltip card ────────────────────────────────
function ProvinceCard({ geoName }: { geoName: string }) {
  const p = statsForGeo(geoName);
  if (!p) return null;
  const color = STATUS_GLOW[p.status];
  const activeRate = Math.round((p.active / p.students) * 100);
  return (
    <motion.div
      key={geoName}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        background: "#ffffff",
        border: `1px solid #e5e7eb`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginTop: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{p.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 800,
          background: `${color}20`, border: `1px solid ${color}50`,
          borderRadius: 50, padding: "2px 8px", color,
        }}>{p.status.toUpperCase()}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {[
          { l: "Students", v: p.students.toLocaleString() },
          { l: "Active Today", v: p.active.toLocaleString() },
          { l: "Mastery", v: `${p.mastery}%` },
        ].map(s => (
          <div key={s.l} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 5, padding: "6px 8px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: C.text, fontFamily: "'Times New Roman', serif" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Active rate bar */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Active Rate</span>
          <span style={{ fontSize: 9, fontWeight: 900, color }}>{activeRate}%</span>
        </div>
        <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2 }}>
          <div style={{ width: `${activeRate}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s" }}/>
        </div>
      </div>
    </motion.div>
  );
}

// ── Live feed ────────────────────────────────────────────
function LiveFeed() {
  const [events, setEvents] = useState(() =>
    LIVE_EVENTS.slice(0, 5).map((e, i) => ({ ...e, id: i, ts: Date.now() - (5 - i) * 12000 }))
  );
  const counterRef = useRef(LIVE_EVENTS.length);

  useEffect(() => {
    const id = setInterval(() => {
      const src = LIVE_EVENTS[counterRef.current % LIVE_EVENTS.length];
      counterRef.current++;
      setEvents(prev => [
        { ...src, id: counterRef.current, ts: Date.now() },
        ...prev.slice(0, 11),
      ]);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  function elapsed(ts: number) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    return `${Math.round(s / 60)}m ago`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <AnimatePresence initial={false}>
        {events.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1 - i * 0.07, height: "auto", marginBottom: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "7px 12px",
              borderLeft: `2px solid ${EVENT_COLOR[ev.type]}`,
              background: i === 0 ? `${EVENT_COLOR[ev.type]}10` : "transparent",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <motion.div
              style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                background: EVENT_COLOR[ev.type],
              }}
              animate={i === 0 ? { scale: [1, 1.6, 1] } : {}}
              transition={{ duration: 0.6 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: i === 0 ? "#111827" : "#374151", fontWeight: i === 0 ? 700 : 600, lineHeight: 1.4 }}>
                {ev.text}
              </div>
              <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2, fontWeight: 700 }}>
                {ev.province} · {elapsed(ev.ts)}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Region summary ────────────────────────────────────────
function RegionBreakdown() {
  const regions = ["Momase", "Highlands", "Papuan", "Islands"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {regions.map(region => {
        const ps = PROVINCES.filter(p => p.region === region);
        const total   = ps.reduce((a, p) => a + p.students, 0);
        const active  = ps.reduce((a, p) => a + p.active, 0);
        const mastery = Math.round(ps.reduce((a, p) => a + p.mastery, 0) / ps.length);
        const rate    = Math.round((active / total) * 100);
        const color   = REGION_COLORS[region];
        return (
          <div key={region} style={{
            background: C.panel, border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${color}`,
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.text }}>{region}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color }}>{mastery}% avg</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6 }}>
              {active.toLocaleString()} / {total.toLocaleString()} active
            </div>
            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rate}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ height: "100%", background: color, borderRadius: 2 }}
              />
            </div>
            <div style={{ fontSize: 9, color: "#6b7280", marginTop: 3, fontWeight: 700, textAlign: "right" }}>
              {rate}% active rate
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Province leaderboard ──────────────────────────────────
function Leaderboard() {
  const sorted = [...PROVINCES].sort((a, b) => b.mastery - a.mastery);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["#", "Province", "Region", "Enrolled", "Active Today", "Active Rate", "Avg Mastery", "Status"].map(h => (
              <th key={h} style={{
                textAlign: "left", padding: "8px 12px",
                fontSize: 9, fontWeight: 900, letterSpacing: 0.7,
                color: C.muted, textTransform: "uppercase",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const activeRate = Math.round((p.active / p.students) * 100);
            const glowColor  = STATUS_GLOW[p.status];
            const regionColor = REGION_COLORS[p.region];
            return (
              <motion.tr
                key={p.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                style={{
                  borderBottom: `1px solid #f3f4f6`,
                  background: i < 3 ? `rgba(245,166,35,0.06)` : "transparent",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i < 3 ? "rgba(245,166,35,0.06)" : "transparent"; }}
              >
                <td style={{ padding: "9px 12px", fontWeight: 900, color: i < 3 ? C.gold : C.muted }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </td>
                <td style={{ padding: "9px 12px", fontWeight: 800, color: C.text }}>{p.name}</td>
                <td style={{ padding: "9px 12px" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: regionColor,
                    background: `${regionColor}18`, borderRadius: 50,
                    padding: "2px 7px", border: `1px solid ${regionColor}35`,
                  }}>{p.region}</span>
                </td>
                <td style={{ padding: "9px 12px", color: C.muted, fontWeight: 700 }}>{p.students.toLocaleString()}</td>
                <td style={{ padding: "9px 12px", color: glowColor, fontWeight: 800 }}>{p.active.toLocaleString()}</td>
                <td style={{ padding: "9px 12px", minWidth: 100 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: "#e5e7eb", borderRadius: 2 }}>
                      <div style={{ width: `${activeRate}%`, height: "100%", background: glowColor, borderRadius: 2 }}/>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: glowColor, minWidth: 30 }}>{activeRate}%</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: "#e5e7eb", borderRadius: 2 }}>
                      <div style={{
                        width: `${p.mastery}%`, height: "100%", borderRadius: 2,
                        background: p.mastery >= 70 ? C.green : p.mastery >= 60 ? C.gold : C.red,
                      }}/>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 900,
                      color: p.mastery >= 70 ? C.green : p.mastery >= 60 ? C.gold : C.red,
                      minWidth: 30,
                    }}>{p.mastery}%</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: glowColor,
                    background: `${glowColor}18`,
                    border: `1px solid ${glowColor}40`,
                    borderRadius: 50, padding: "2px 8px",
                  }}>
                    {p.status === "active" ? "Online" : p.status === "warn" ? "Partial" : "Offline"}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Sync button (Garmin-style) ────────────────────────────
function SyncButton({ onSync }: { onSync: () => void }) {
  const [syncing, setSyncing]       = useState(false);
  const [lastSync, setLastSync]     = useState<Date>(new Date());
  const [elapsed, setElapsed]       = useState("just now");

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.round((Date.now() - lastSync.getTime()) / 1000);
      if (s < 10)  setElapsed("just now");
      else if (s < 60) setElapsed(`${s}s ago`);
      else         setElapsed(`${Math.round(s / 60)}m ago`);
    }, 5000);
    return () => clearInterval(id);
  }, [lastSync]);

  function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const now = new Date();
      setLastSync(now);
      setElapsed("just now");
      onSync();
    }, 1600);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {syncing ? "Syncing data…" : `Last sync · ${elapsed}`}
        </span>
        <button
          onClick={handleSync}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: syncing ? "rgba(22,163,74,0.25)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${syncing ? "rgba(22,163,74,0.6)" : "rgba(255,255,255,0.2)"}`,
            borderRadius: 6, padding: "4px 10px", cursor: syncing ? "default" : "pointer",
            color: syncing ? C.green : "#ffffff",
            fontSize: 10, fontWeight: 800, fontFamily: "'Times New Roman', serif",
            letterSpacing: 0.3, transition: "all 0.2s",
          }}
        >
          <motion.svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            animate={syncing ? { rotate: 360 } : { rotate: 0 }}
            transition={syncing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0.3 }}
          >
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </motion.svg>
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>
    </div>
  );
}

// ── Live clock ────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", fontFamily: "'Times New Roman', serif", lineHeight: 1 }}>
        {time.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginTop: 2 }}>
        {time.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function GovernmentDashboard() {
  const [hovered,          setHovered]          = useState<string | null>(null);
  const [mapView,          setMapView]          = useState<"map" | "list">("map");
  const [selectedProvince, setSelectedProvince] = useState<ProvRow | null>(null);
  const [syncKey,          setSyncKey]          = useState(0);

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.background = C.bg;
    return () => {
      document.body.style.overflow = "";
      document.body.style.background = "";
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    overflow: "hidden",
  };

  const sectionHeader = (label: string, sub?: string) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
      background: "#fafafa",
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, color: C.text, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: C.muted, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'Times New Roman', serif",
      color: C.text,
    }}>

      {/* ── Top accent strip ── */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #F5A623, #E84D2A, #7c3aed, #2563eb)" }}/>

      {/* ── Nav ── */}
      <div style={{
        background: C.navy,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 28px",
        height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Left: logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            background: "#fff", borderRadius: 7,
            padding: "2px 8px",
            display: "flex", alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}>
            <img src="/New-Logo.png" alt="Stori Bilong Yu" style={{ height: 38, width: "auto", display: "block" }}/>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.25)" }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#ffffff", letterSpacing: 0.2 }}>National Learning Dashboard</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginTop: 1 }}>Ministry of Education · Papua New Guinea</div>
          </div>
        </div>

        {/* Centre: live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <span style={{ fontSize: 11, fontWeight: 900, color: C.green }}>LIVE</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>· Real-time data across all provinces</span>
        </div>

        {/* Right: sync + clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <SyncButton onSync={() => setSyncKey(k => k + 1)} />
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)" }} />
          <LiveClock />
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── KPI row ── */}
        <div key={syncKey} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <KpiCard icon={<IcoUsers />}    label="Total Enrolled"   value={NATIONAL.enrolled}    color="#3b82f6" delay={0}   />
          <KpiCard icon={<IcoActivity />} label="Active Today"     value={NATIONAL.activeToday}  color={C.green} delay={80}  />
          <KpiCard icon={<IcoBook />}     label="Sessions This Week" value={NATIONAL.sessions}   color={C.gold}  delay={160} unit="" />
          <KpiCard icon={<IcoTarget />}   label="National Mastery"  value={NATIONAL.avgMastery}  color="#a78bfa" delay={240} unit="%" />
          <KpiCard icon={<IcoGlobe />}    label="Provinces Online"  value={NATIONAL.provinces}   color={C.green} delay={320} />
          <KpiCard icon={<IcoSchool />}   label="Schools Connected" value={NATIONAL.schools}      color={C.amber} delay={400} />
        </div>

        {/* ── Main 2-col body ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>

          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Map panel */}
            <div style={panelStyle}>

              {/* Panel header with view toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
                background: "#fafafa",
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.text, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    National Coverage Map
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 1, fontWeight: 600 }}>
                    Province-level engagement · All 22 provinces
                  </div>
                </div>

                {/* Tab toggle */}
                <div style={{
                  display: "flex",
                  background: "#e5e7eb",
                  borderRadius: 7,
                  padding: 3,
                  gap: 2,
                }}>
                  {(["map", "list"] as const).map(v => {
                    const active = mapView === v;
                    const col = active ? C.navy : C.muted;
                    return (
                      <button
                        key={v}
                        onClick={() => setMapView(v)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 14px",
                          borderRadius: 5,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 800,
                          fontFamily: "'Times New Roman', serif",
                          background: active ? "#ffffff" : "transparent",
                          color: col,
                          boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                          transition: "all 0.15s",
                          letterSpacing: 0.2,
                        }}
                      >
                        {v === "map" ? <IcoMap color={col} /> : <IcoList color={col} />}
                        {v === "map" ? "Map View" : "List View"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Panel body — animated swap */}
              <AnimatePresence mode="wait">
                {mapView === "map" ? (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ padding: "12px 12px 8px", position: "relative" }}
                  >
                    <div style={{ height: 640 }}>
                      <PngMap
                        onHover={setHovered}
                        hovered={hovered}
                        onSelect={geoName => {
                          const p = statsForGeo(geoName);
                          if (p) setSelectedProvince(p);
                        }}
                      />
                    </div>

                    {/* Floating province detail card */}
                    <AnimatePresence>
                      {hovered && (
                        <motion.div
                          key={hovered}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: "absolute",
                            top: 28, right: 28,
                            width: 230,
                            zIndex: 10,
                            pointerEvents: "none",
                          }}
                        >
                          <ProvinceCard geoName={hovered} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflowX: "auto" }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${C.border}` }}>
                          {["Province", "Region", "Enrolled", "Active Today", "Active Rate", "Avg Mastery", "Status"].map(h => (
                            <th key={h} style={{
                              textAlign: "left", padding: "10px 14px",
                              fontSize: 9, fontWeight: 900, letterSpacing: 0.8,
                              color: C.muted, textTransform: "uppercase",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...PROVINCES]
                          .sort((a, b) => b.mastery - a.mastery)
                          .map((p, i) => {
                            const activeRate = Math.round((p.active / p.students) * 100);
                            const statusColor = STATUS_GLOW[p.status];
                            const regionColor = REGION_COLORS[p.region];
                            const masteryColor = p.mastery >= 70 ? C.green : p.mastery >= 63 ? C.amber : C.red;
                            return (
                              <motion.tr
                                key={p.name}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                style={{ borderBottom: `1px solid #f3f4f6`, cursor: "pointer" }}
                                onClick={() => setSelectedProvince(p)}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f4ff"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                              >
                                <td style={{ padding: "10px 14px", fontWeight: 800, color: C.text }}>{p.name}</td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{
                                    fontSize: 10, fontWeight: 800, color: regionColor,
                                    background: `${regionColor}15`, border: `1px solid ${regionColor}30`,
                                    borderRadius: 50, padding: "2px 8px",
                                  }}>{p.region}</span>
                                </td>
                                <td style={{ padding: "10px 14px", color: C.text, fontWeight: 700 }}>{p.students.toLocaleString()}</td>
                                <td style={{ padding: "10px 14px", color: statusColor, fontWeight: 800 }}>{p.active.toLocaleString()}</td>
                                <td style={{ padding: "10px 14px", minWidth: 110 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3 }}>
                                      <div style={{ width: `${activeRate}%`, height: "100%", background: statusColor, borderRadius: 3 }}/>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: statusColor, minWidth: 28 }}>{activeRate}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: "10px 14px", minWidth: 110 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3 }}>
                                      <div style={{ width: `${p.mastery}%`, height: "100%", background: masteryColor, borderRadius: 3 }}/>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: masteryColor, minWidth: 28 }}>{p.mastery}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{
                                    fontSize: 9, fontWeight: 800, color: statusColor,
                                    background: `${statusColor}15`, border: `1px solid ${statusColor}35`,
                                    borderRadius: 50, padding: "3px 9px",
                                  }}>
                                    {p.status === "active" ? "Online" : p.status === "warn" ? "Partial" : "Offline"}
                                  </span>
                                </td>
                              </motion.tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Region breakdown — only in list view */}
            {mapView === "list" && (
              <div style={panelStyle}>
                {sectionHeader("Regional Breakdown", "Aggregated stats by PNG administrative region")}
                <div style={{ padding: 16 }}>
                  <RegionBreakdown />
                </div>
              </div>
            )}


          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AI National Intelligence */}
            <div style={panelStyle}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
                background: "#fafafa",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: "linear-gradient(135deg, #1a2e4a, #2563eb)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}><IcoBrain /></div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.text, textTransform: "uppercase", letterSpacing: 0.8 }}>AI National Intelligence</div>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>Generated from live session data</div>
                </div>
                <div style={{
                  marginLeft: "auto", fontSize: 8, fontWeight: 900,
                  background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)",
                  borderRadius: 50, padding: "2px 8px", color: "#60a5fa",
                }}>AI INSIGHT</div>
              </div>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ margin: 0, fontSize: 11.5, color: "#111827", lineHeight: 1.75, fontWeight: 600 }}>
                  {AI_REPORT.summary}
                </p>
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {AI_REPORT.flags.map((f, i) => (
                  <div key={i} style={{
                    borderLeft: `3px solid ${f.color}`,
                    paddingLeft: 10, paddingTop: 2, paddingBottom: 2,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: f.color, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 10.5, color: "#374151", lineHeight: 1.55, fontWeight: 600 }}>{f.text}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Province drawer ── */}
      <AnimatePresence>
        {selectedProvince && (
          <ProvinceDrawer
            province={selectedProvince}
            onClose={() => setSelectedProvince(null)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: "12px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: C.navy,
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
          Stori Bilong Yu · National Learning Platform · © 2026
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div
            style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>All systems operational</span>
        </div>
      </div>
    </div>
  );
}
