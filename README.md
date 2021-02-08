# paradigm-ctf 2021

My solutions for [Paradigm CTF 2021](https://ctf.paradigm.xyz/).

Solved Challenges:

- [x] Babycrypto
- [ ] Babyrev
- [ ] Babysandbox
- [x] [Bank](./contracts/bank/public/contracts/BankAttacker.sol)
- [x] [Bouncer](./contracts/bouncer/public/contracts/BouncerAttacker.sol)
- [x] [Broker](./contracts/broker/public/contracts/BrokerAttacker.sol)
- [x] [Farmer](./contracts/farmer/public/contracts/FarmerAttacker.sol)
- [x] [Hello](./test/hello.ts)
- [ ] JOP
- [ ] Lockbox
- [x] [Market](./contracts/market/public/contracts/MarketAttacker.sol)
- [ ] Rever
- [x] [Secure](./contracts/secure/public/contracts/SecureAttacker.sol)
- [ ] Swap
- [ ] Upgrade
- [ ] Vault
- [x] [Yield Aggregator](./contracts/yield_aggregator/public/contracts/YieldAggregatorAttacker.sol)

# Running challenges

Most challenges can be run in a local _hardhat_ environment by forking mainnet and deploying the setup contract.
Challenges are implemented as hardhat tests in [`/test`](./test).

To fork the mainnet, you need an archive URL like the free ones from [Alchemy](https://alchemyapi.io/).

## Development

```bash
npm i
```

You need to configure environment variables:

```bash
cp .env.template .env
# fill out

# run challenge farmer
npx hardhat test test/farmer.ts
```
