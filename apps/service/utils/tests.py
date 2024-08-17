import unittest
from utils.utils import months_difference
import datetime


class UtilsTestCase(unittest.TestCase):

    def test_months_difference_same_dates(self):
        date = datetime.datetime.now()
        months = months_difference(date, date)
        self.assertEqual(months, 0)

    def test_months_difference_different_dates(self):
        start_date = datetime.date(2022, 3, 12)
        end_date = datetime.date(2022, 5, 11)
        months = months_difference(start_date, end_date)
        self.assertEqual(months, 2)

    def test_months_difference_floor_months(self):
        start_date = datetime.date(2022, 3, 12)
        end_date = datetime.date(2022, 6, 10)
        months = months_difference(start_date, end_date)
        self.assertEqual(months, 2)

    def test_months_difference_end_date_inclusive(self):
        start_date = datetime.date(2021, 6, 4)
        end_date = datetime.date(2022, 6, 3)
        months = months_difference(start_date, end_date)
        self.assertEqual(months, 12)


if __name__ == '__main__':
    unittest.main()
