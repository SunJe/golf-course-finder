-- GolfMap Korea — verified Gaya/Adonis data hygiene
-- MANUAL REVIEWED SQL: run only after PR merge and separate Production approval.
-- This is intentionally not an auto-applied migration and does not perform a full upload.

begin;

do $$
declare
  affected_rows integer;
begin
  if (
    select count(*)
    from public.golf_courses
    where id = 'gc-9bd0f98bfdee'
      and address = '김해시 인제로 495'
      and latitude = 35.2706641912159
      and longitude = 128.892223791295
      and phone = '055-337-0091'
      and homepage_url = 'http://www.gayacc.com/'
      and booking_url is null
  ) <> 1 then
    raise exception 'Gaya Public precondition failed; aborting without overwrite';
  end if;

  if (
    select count(*)
    from public.golf_courses
    where id = 'gc-e2614722e86e'
      and phone = '031-530-9100'
      and homepage_url = 'http://www.adoniscc.co.kr/'
      and booking_url is null
  ) <> 1 then
    raise exception 'Adonis Public precondition failed; aborting without overwrite';
  end if;

  update public.golf_courses
  set
    address = '경상남도 김해시 인제로 502',
    latitude = 35.2739312,
    longitude = 128.8981004,
    phone = '055-337-0091',
    homepage_url = 'https://www.gayacc.com/main_new.php',
    booking_url = 'https://www.gayacc.com/reserve.php?location=04',
    updated_at = now()
  where id = 'gc-9bd0f98bfdee';

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Gaya Public update affected % rows', affected_rows;
  end if;

  update public.golf_courses
  set
    phone = '031-530-9140',
    homepage_url = 'https://www.adoniscc.co.kr/public',
    booking_url = 'https://www.adoniscc.co.kr/public/booking',
    updated_at = now()
  where id = 'gc-e2614722e86e';

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Adonis Public update affected % rows', affected_rows;
  end if;

  if (select count(*) from public.golf_courses) <> 532 then
    raise exception 'Postcondition failed: expected 532 total rows';
  end if;

  if exists (
    select id from public.golf_courses group by id having count(*) > 1
  ) then
    raise exception 'Postcondition failed: duplicate course IDs';
  end if;

  if (
    select count(*) from public.golf_courses
    where id in ('gc-9bd0f98bfdee', 'gc-e2614722e86e', 'gc-5384133fb9bc')
  ) <> 3 then
    raise exception 'Postcondition failed: required canonical IDs missing';
  end if;

  if exists (
    select 1 from public.golf_courses
    where id in ('gc-6edc35233517', 'gc-eed59bb8d6c7', 'gc-41ded2b48d1a')
  ) then
    raise exception 'Postcondition failed: accidental rehash ID detected';
  end if;

  if not exists (
    select 1 from public.golf_courses
    where id = 'gc-9bd0f98bfdee'
      and address = '경상남도 김해시 인제로 502'
      and latitude = 35.2739312
      and longitude = 128.8981004
      and phone = '055-337-0091'
      and homepage_url = 'https://www.gayacc.com/main_new.php'
      and booking_url = 'https://www.gayacc.com/reserve.php?location=04'
  ) then
    raise exception 'Postcondition failed: Gaya Public values';
  end if;

  if not exists (
    select 1 from public.golf_courses
    where id = 'gc-5384133fb9bc'
      and address = '김해시 인제로 495'
      and latitude = 35.2706641912159
      and longitude = 128.892223791295
      and phone = '055-337-0091'
      and homepage_url = 'http://www.gayacc.com/'
      and booking_url is null
  ) then
    raise exception 'Postcondition failed: Gaya Member changed';
  end if;

  if not exists (
    select 1 from public.golf_courses
    where id = 'gc-e2614722e86e'
      and phone = '031-530-9140'
      and homepage_url = 'https://www.adoniscc.co.kr/public'
      and booking_url = 'https://www.adoniscc.co.kr/public/booking'
  ) then
    raise exception 'Postcondition failed: Adonis Public values';
  end if;
end $$;

commit;
