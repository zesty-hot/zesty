create view full_profile as
select
  *
from auth.users u
left join zesty_user p on u.id::text = p."supabaseId";

COMMIT;

ALTER TABLE zesty_user ENABLE ROW LEVEL SECURITY;

COMMIT;

CREATE POLICY "Users can select their own profile"
ON zesty_user
FOR SELECT
USING ("supabaseId" = auth.uid());

COMMIT;