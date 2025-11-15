const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { documentService } = require('../services');

const createDocument = catchAsync(async (req, res) => {
  const document = await documentService.createDocument(req.files, req.body);
  res.status(httpStatus.CREATED).send(document);
});
const createlease = catchAsync(async (req, res) => {
  const document = await documentService.createLease(req.files, req.body);
  res.status(httpStatus.CREATED).send(document);
});
const getDocument = catchAsync(async (req, res) => {
  const document = await documentService.getDocumentById(req.params.documentId);
  res.send(document);
});

const getUserDocuments = catchAsync(async (req, res) => {
  const result = await documentService.getDocumentsByUser(req.params.id);
  res.send(result);
});

const updateDocument = catchAsync(async (req, res) => {
  const document = await documentService.updateDocument(
    req.params.documentId,
    req.body,
    req.file,
  );
  res.send(document);
});

const deleteDocument = catchAsync(async (req, res) => {
  await documentService.deleteDocument(req.params.documentId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDocument,
  createlease,
  getDocument,
  getUserDocuments,
  updateDocument,
  deleteDocument,
};
