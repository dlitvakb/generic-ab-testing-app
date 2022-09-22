const experiments = [
  {
    "id": "test_ab",
    "variations": [
      {
        "id": "base",
        "rate": 80
      },
      {
        "id": "test",
        "rate": 20
      }
    ]
  },
  {
    "id": "test_abc",
    "variations": [
      {
        "id": "base",
        "rate": 60
      },
      {
        "id": "test_1",
        "rate": 20
      },
      {
        "id": "test_2",
        "rate": 20
      }
    ]
  }
]

export default experiments;
