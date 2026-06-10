CREATE OR REPLACE FUNCTION update_campaign_total(cid uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET 
    current_amount = current_amount + amount,
    backers_count = backers_count + 1
  WHERE id = cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;