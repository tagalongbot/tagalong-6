// This library is used for managing leads for each practice
let { getNumbersOnly, formatPhoneNumber } = require('../../../libs/helpers.js');

let { getTable, getAllDataFromTable, findTableData, createTableData, updateTableData } = require('../../../libs/data.js');

let getLeadsTable = getTable('Leads');

let getPracticeLead = async ({ practice_leads_base_id, lead_id }) => {
  let leadsTable = getLeadsTable(practice_leads_base_id);
  let findLead = findTableData(leadsTable);
  let lead = await findLead(lead_id);
  return lead;
}

let getPracticeLeads = async ({ practice_leads_base_id, view = 'Main View' }) => {
  let leadsTable = getLeadsTable(practice_leads_base_id);
  let getLeads = getAllDataFromTable(leadsTable);

  let leads = await getLeads({ view });
  return leads;
}

let createPracticeLead = async ({ practice_leads_base_id, lead_data }) => {
  let leadsTable = getLeadsTable(practice_leads_base_id);
  let createLead = createTableData(leadsTable);
  
  let new_lead = await createLead(lead_data);
  return new_lead;
}

let updatePracticeLead = async ({ practice_leads_base_id, lead_data, lead }) => {
  let leadsTable = getLeadsTable(practice_leads_base_id);
  let updateLead = updateTableData(leadsTable);

  let updated_lead = await updateLead(lead_data, lead);
  return updated_lead;
}

let getUniqueLead = async ({ practice_leads_base_id, user_phone_number, promotion_name }) => {
  let leadsTable = getLeadsTable(practice_leads_base_id);
  let getLeads = getAllDataFromTable(leadsTable);
  
  let phone_number = getNumbersOnly(user_phone_number).slice(-10);

  let filterByFormula = `AND({Phone Number} = '${formatPhoneNumber(phone_number)}', {Claimed Promotion Name} = '${promotion_name}')`;
  let [lead] = await getLeads({ filterByFormula });
  return lead;
}

module.exports = {
  getPracticeLead,
  getPracticeLeads,
  createPracticeLead,
  updatePracticeLead,
  getUniqueLead,
}