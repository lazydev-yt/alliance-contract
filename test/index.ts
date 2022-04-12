import { expect } from "chai";
import { ethers } from "hardhat";

const GENERIC_TOKEN = 0;

describe("Alliance", function () {
  it("Initial mint after deploy", async function () {
    const [owner] = await ethers.getSigners();
    const Alliance = await ethers.getContractFactory("Alliance");
    const eng = await Alliance.deploy("ipfs://<some-ipfs-cid>/");
    await eng.deployed();

    expect(await eng.balanceOf(owner.address, GENERIC_TOKEN)).to.equal(
      ethers.BigNumber.from(1e9)
    );
  });

  it("setURI", async function () {
    const Alliance = await ethers.getContractFactory("Alliance");
    const eng = await Alliance.deploy("ipfs://<some-ipfs-cid>/");
    await eng.deployed();

    await eng.setURI("ipfs://<another-ipfs-cid>/");
    expect(await eng.uri(GENERIC_TOKEN)).to.equal(
      "ipfs://<another-ipfs-cid>/0"
    );
  });

  it("stake", async function () {
    const [owner, company, employee] = await ethers.getSigners();
    const Alliance = await ethers.getContractFactory("Alliance");
    const eng = await Alliance.deploy("ipfs://<some-ipfs-cid>/");
    await eng.deployed();

    await eng
      .connect(owner)
      .safeTransferFrom(
        owner.address,
        company.address,
        GENERIC_TOKEN,
        1e6,
        "0x00"
      );

    await eng.connect(company).stake(employee.address, [1, 2, 3]);
    expect(await eng.balanceOf(company.address, GENERIC_TOKEN)).to.equal(
      ethers.BigNumber.from(1e6 - 30)
    );
    expect(
      await eng.balanceOfBatch(
        [employee.address, employee.address, employee.address],
        [1001, 1002, 1003]
      )
    ).to.deep.equal([
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
    ]);
  });

  it("reward", async function () {
    const [owner, company, employee] = await ethers.getSigners();
    const Alliance = await ethers.getContractFactory("Alliance");
    const eng = await Alliance.deploy("ipfs://<some-ipfs-cid>/");
    await eng.deployed();

    await eng
      .connect(owner)
      .safeTransferFrom(
        owner.address,
        company.address,
        GENERIC_TOKEN,
        1e6,
        "0x00"
      );

    await eng.connect(company).stake(employee.address, [1, 2, 3]);
    await eng.connect(company).reward(employee.address, [1, 2, 3], [10, 4, 9]);

    expect(
      await eng.balanceOfBatch(
        [employee.address, employee.address, employee.address],
        [1001, 1002, 1003]
      )
    ).to.deep.equal([
      ethers.BigNumber.from(0),
      ethers.BigNumber.from(0),
      ethers.BigNumber.from(0),
    ]);
    expect(
      await eng.balanceOfBatch(
        [employee.address, employee.address, employee.address],
        [1, 2, 3]
      )
    ).to.deep.equal([
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(4),
      ethers.BigNumber.from(9),
    ]);
  });

  it("reward", async function () {
    const [owner, company, employee] = await ethers.getSigners();
    const Alliance = await ethers.getContractFactory("Alliance");
    const eng = await Alliance.deploy("ipfs://<some-ipfs-cid>/");
    await eng.deployed();

    await eng
      .connect(owner)
      .safeTransferFrom(
        owner.address,
        company.address,
        GENERIC_TOKEN,
        1e6,
        "0x00"
      );

    await eng.connect(company).stake(employee.address, [1, 2, 3]);
    await eng.connect(company).reward(employee.address, [1, 2, 3], [10, 4, 9]);
    await eng.connect(company).stake(employee.address, [1, 2, 3]);
    await eng.connect(company).reward(employee.address, [1, 2, 3], [10, 4, 9]);
    await eng.connect(company).stake(employee.address, [1, 2, 3]);
    await eng.connect(company).reward(employee.address, [1, 2, 3], [10, 4, 9]);

    expect(
      await eng.balanceOfBatch(
        [employee.address, employee.address, employee.address],
        [1, 2, 3]
      )
    ).to.deep.equal([
      ethers.BigNumber.from(30),
      ethers.BigNumber.from(12),
      ethers.BigNumber.from(27),
    ]);

    await eng.connect(employee).mintNFT(1);
    expect(await eng.balanceOf(employee.address, 1)).to.equal(
      ethers.BigNumber.from(5)
    );
    expect(await eng.balanceOf(employee.address, 100000)).to.equal(
      ethers.BigNumber.from(1)
    );
  });
});
